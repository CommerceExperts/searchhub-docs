Service Integration
===================

.. note::

    This is the recommended integration approach, as the suggest service can be consumed directly from the frontend.

    The `Java integration`_ is primarily intended for scenarios where you want to integrate it with an existing suggestion service or extend it with additional custom data sources. This option is only available if your application runs in a JVM environment.


You may notice that the first test request returns empty results. This happens because smartSuggest only starts fetching the required data after the first request for a tenant is received. During the first few seconds, requests may therefore return empty results. Once the data has been loaded, suggestions should start appearing (assuming the API key is correctly configured and the tenant is valid).
The initial startup latency can be reduced by preloading tenants using the preloadTenants parameter (SH_INIT_TENANTS), which is described in the `Operations`_  section.


Contextual Pre-Suggest Request
------------------------------

Since version 2.5, the service provides an endpoint for retrieving contextual query recommendations that can be displayed before the user starts typing. To improve the relevance of the recommended queries, the current shop URL must be passed to the service:

.. code-block:: bash

  http://<host>:<port>/contextual/<version>/<tenant-name>/<tenant-channel>?context=<uri>[&limit=<n>]

**Request Parameters**:

    - **version (path):** one of "v1", "v2", "v3" or "v4" depending on the desired response format (v4 not meaning full, but compatible)
    - **tenant-name (path):** the first part of the tenant provided by searchHub
    - **tenant-channel (path):** the second part of the tenant provided by searchHub
    - **context (query):** the encoded URI of the page where the contextual suggestions should be shown. For generic pages (e.g. the start page) the referrer uri can be passed.
    - **limit (query):** This parameter will limit the amount of returned suggestions. By default if omitted, the limit is set to 10.

The response format depends on the picked version. See "Response versions" below.


Suggest Request
---------------

Standard suggest requests, which return queries relevant to the user's partial input, use the following request:

.. code-block:: bash

  http://<host>:<port>/smartsuggest/<version>/<tenant-name>/<tenant-channel>?userQuery=<user-query>[&limit=<n>]

**Request Parameters**:

    - **version (path):** one of "v1", "v2", "v3" or "v4" depending on the desired response format
    - **tenant-name (path):** the first part of the tenant provided by searchHub
    - **tenant-channel (path):** the second part of the tenant provided by searchHub
    - **userQuery (query):** the text the user entered in the search box
    - **limit (query):** This parameter will limit the amount of returned suggestions. By default if omitted, the limit is set to 10.

The response format depends on the picked version. See "Response versions" below.


Response variants
-----------------

The suggest service provides several request versions that return different levels of detail. The suggestions themselves remain the same; only the response structure and the metadata attached to the suggestions differ.

The correct version path fragments are one of "v1", "v2", "v3" or "v4".


V1 Response
^^^^^^^^^^^

In this version, suggestions are returned in blocks, where each block represents a different match quality based on how the suggestions were generated.
This allows clients to filter or restrict results to the highest-quality suggestions if desired.


**Response**:

.. code-block:: json

  [
    {
      "name": "best matches",
      "suggestions": [
        "suggestion 1",
        "suggestion 2",
        "etc."
      ]
    }
  ]

The **“best matches”** block contains the highest-quality suggestions. Additional blocks may include **“typo matches”**, **“fuzzy matches with 1 edit”**, and **“fuzzy matches with 2 edits”**.
If no suggestions are available, the response will contain an empty array.
Depending on the input and configuration, multiple blocks may be returned. In this case, the client must decide which suggestions to display in the autosuggest component.
If such custom logic is not required, API v2 or v3 is recommended.


V2 Response
^^^^^^^^^^^

This version is intended for the simplest possible integration, as it returns only an array of suggestion strings.
No grouping or metadata is included—only the suggested queries themselves. This option is useful if you want a straightforward integration without advanced features.

**Response**:

The response is a JSON array with simple strings that can be used as autocompletion result.

.. code-block:: json

  [
    "suggestion 1",
    "suggestion 2",
    "etc."
  ]


V3 Response
^^^^^^^^^^^

This version returns suggestions as structured objects with associated metadata, rather than plain strings.

**Response**:

The response is a JSON array of suggestion objects. Each object contains a payload with additional metadata related to the autosuggestion query.
The payload may include the following keys:

meta.matchKey
  The actual text that was matched during the search. For unusual queries that match one of the cluster variants, this value may reveal the full set of related queries.  
  This field is mainly intended for **debugging purposes**.

meta.matchGroupName
  The name of the match group, corresponding to the group names described for the **v1 request**.

meta.weight
  The internal weight assigned to the suggestion. Suggestions are ordered by this weight, unless the match type introduces an additional penalty.

type
  The type of suggestion. Currently, the only supported value is *keyword*.  
  If additional data sources are added to the suggest index, other values such as ``product`` or ``category`` may appear.

redirect
  The redirect URL configured for the query in the searchHub UI. **Optional** this field is omitted if no redirect is configured.  
  If present, it is recommended to redirect directly to this URL to avoid an unnecessary request to the search backend.

Additional fields per record:

recommendedProducts
  A list (array) of record objects. Each record contains a ``sku`` and a ``data`` map with product fields such as ``title``, ``image``, ``brand``, and ``link``.

scopes
  An optional list of scopes that further refine the suggestion, such as categories, brands, or other relevant attributes.  
  For example, the suggestion ``jeans`` could include scopes like ``for women`` or ``for men``.

  If searchHub does not provide this information, or if **scope expansion** is enabled on the searchHub side, this field will be ``null``.

.. code-block:: json

  [
    {
      "payload": {
        "meta.matchKey": "suggestion1",
        "meta.matchGroupName": "best matches",
        "meta.weight": 10234,
        "type": "keyword"
      },
      "suggestion": "suggestion1",
      "recommendedProducts": null,
      "scopes": null
    },
    {
      "payload": {
        "meta.matchKey": "suggestion2",
        "meta.matchGroupName": "best matches",
        "meta.weight": 10199,
        "type": "keyword"
      },
      "suggestion": "suggestion2",
      "recommendedProducts": null,
      "scopes": [
         {"id":"c4404","name":"Hardware"},
         {"id":"c2202","name":"Accessories"}
      ]
    },
    {
      "payload": {
        "meta.matchKey": "suggestion3",
        "meta.matchGroupName": "best matches",
        "meta.weight": 10033,
        "type": "keyword",
        "redirect": "https://some-redirect-url.com",
      },
      "suggestion": "suggestion3",
      "recommendedProducts": [
        {
         "sku":"p123", 
         "data": {"title": "Product One2Three", "image": "https://...", "brand": "Numerical", "link": "https://..."}
        },
        {
         "sku":"p543", 
         "data": {"title": "Product five2Three", "image": "https://...", "brand": "Other", "link": "https://..."}
        }
      ],
      "scopes": null
    }
  ]


V4 Response
^^^^^^^^^^^

.. warning::

    This endpoint is only available when using the ``commerceexperts/searchhub-integration-service``, as it relies on the smartQuery module to enrich the response.

It is particularly useful for **low-latency frontend integrations**, where the smartQuery mapping should be retrieved while the user is still typing in the suggestion field. This is exactly how the `Javascript Client`_ operates, which is why it depends on this specific endpoint.

.. code-block:: bash

  http://<host>:<port>/smartsuggest/v4/<tenant-name>/<tenant-channel>?userQuery=<user-query>[&limit=<n>][&sessionId=<SearchCollectorSession>]

**Request Parameters**:

    - **tenant-name (path):** the first part of the tenant provided by searchHub
    - **tenant-channel (path):** the second part of the tenant provided by searchHub
    - **userQuery (query):** the text the user entered in the search box
    - **limit (query):** This parameter will limit the amount of returned suggestions. By default if omitted, the limit is set to 10.
    - **sessionId (query):** This optional parameter improves the integration of smartQuery. See the according `Integration with sessionId`_ section for details.

**Response**:

The response is a JSON object with two main fields: a ``suggestions`` array (similar to the v3 response format) and a ``mappingTarget`` object, as described in the `smartQuery integration`_ section.

.. code-block:: json

    {
      "suggestions": [
        {
          "payload": {
            "meta.matchKey": "suggestion a1",
            "mappingTarget.searchQuery": "master query a1",
            "type": "keyword",
            "meta.weight": "37220",
            "mappingTarget.redirect": null,
            "meta.matchGroupName": "best matches"
          },
          "suggestion": "suggestion a1",
          "recommendedProducts": null,
          "scopes": null
        }
      ],
      "mappingTarget": {
        "userQuery": "a1",
        "masterQuery": "master query a1",
        "redirect": null,
        "potentialCorrections": null,
        "relatedQueries": null,
        "resultModifications": null,
        "successful": false,
        "searchQuery": "master query a1"
      }
    }



.. _smartQuery integration: ../smartquery/integration.html
.. _Integration with sessionId: ../smartquery/integration.html#integration-with-sessionid
.. _Javascript Client: https://github.com/CommerceExperts/searchhub-js-client/
.. _Java integration: java-integration.html
.. _Operations: service-operations.html
