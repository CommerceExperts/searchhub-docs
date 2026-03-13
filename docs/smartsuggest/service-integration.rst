Service Integration
===================

.. note::

    This is the recommended way to integrate suggest, as the service can be directly consumed from your frontend!

    The `Java integration`_ is only recommended in the case you want to combine it with your existing suggest service or extend the suggest service with more custom data source. And of course it's only possible if your service is running inside a JVM environment.


You might wonder why you get empty results for your first test request. Please notice, that smartSuggest starts fetching the necessary data, after the first request for a tenant was received. So the first few seconds all requests will return an empty result. A few seconds later you should get suggestions (if API Key is correctly set and the used tenant is correct).
It's possible to mittigate that startup latency by specifying the tenants using the preloadTenants parameter (SH_INIT_TENANTS), which is described in the `Operations`_  section.


Contextual Pre-Suggest Request
------------------------------

Starting from version 2.5 we provide an endpoint path that provides suggestions - or rather query recommendations - that can be shown before the user even starts typing. To increase the potential relevance of the shown queries, the current URL in the shop must be provided to the service:

.. code-block:: bash

  http://<host>:<port>/smartsuggest/<version>/<tenant-name>/<tenant-channel>?context=<uri>[&limit=<n>]

**Request Parameters**:

    - version (path): one of "v1", "v2", "v3" or "v4" depending on the desired response format (v4 not meaning full, but compatible)
    - tenant-name (path): the first part of the tenant provided by searchHub
    - tenant-channel (path): the second part of the tenant provided by searchHub
    - context (query): the encoded URI of the page where the contextual suggestions should be shown. For generic pages (e.g. the start page) the referrer uri can be passed.
    - limit (query): This parameter will limit the amount of returned suggestions. By default if omitted, the limit is set to 10.

The response format depends on the picked version. See "Response versions" below.


Suggest Request
---------------

The standard suggest requests that return queries relevant to the partial user input, use this request:

.. code-block:: bash

  http://<host>:<port>/smartsuggest/v1/<tenant-name>/<tenant-channel>?userQuery=<user-query>[&limit=<n>]

**Request Parameters**:

    - version (path): one of "v1", "v2" or "v3" depending on the desired response format
    - tenant-name (path): the first part of the tenant provided by searchHub
    - tenant-channel (path): the second part of the tenant provided by searchHub
    - userQuery (query): the text the user entered in the search box
    - limit (query): This parameter will limit the amount of returned suggestions. By default if omitted, the limit is set to 10.

The response format depends on the picked version. See "Response versions" below.


Response variants
-----------------

The suggest service comes with several request versions, that give you a different level of detail.
The suggestions themselves are all the same, just the structure or the meta data attached to the suggestions will differ.


V1 Response
^^^^^^^^^^^

This version will deliver the suggestions grouped into blocks. Each block represents a different quality of suggestions depending on how they matched. This might be useful if you want to restrict the list to only the best matching suggestions.


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

A block with the name "best matches" is the best case scenario. There are also 3 other kind of blocks, named "typo matches", "fuzzy matches with 1 edit" and "fuzzy matches with 2 edits". In case nothing is found, an empty array is returned.
It is also possible (depending on settings and user input) that several blocks are delivered. In such a case it's up to you to decide which queries to use for the autosuggestion.
If there is no need for some special logic, we recommend to use API v2 or v3.


V2 Response
^^^^^^^^^^^

This version is for the simplest integration, as it will just deliver an array of strings. No grouping, no meta data. Just queries as strings. This is useful if you want a simple integration without any sophisticated feature.

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

This version delivers a list of suggestions, where each suggestion is a rich object that also has some meta data attached to it.

**Response**:

The response is a JSON array consisting of rich objects that contain an additional payload for every autosuggestion query.
The payload might contain the following keys:

meta.matchKey
  The actual text that was searched and matched. Especially for untypical queries matching one of the cluster variants, this will yield a complete list of queries.
  The main purpose of this value is debugging.
meta.matchGroupName
  Corresponds to the group names as described for the v1 request.
meta.weight
  This will be set to the internal weight of that suggestion. That's the weight the suggestions are ordered, unless the match-type won't give an extra penalty.
type
  Currently, the only supported value is *keyword*. In case you add another data source to the suggest index, this could be something like "product" or "category".
redirect
  The redirect URL, configured for the query over the searchHub-UI. **Optional** omitted if no redirect exists.
  If this value is given, it's recommended to redirect directly to that URL and avoid an unnecessary request to your search backend.

Additional fields per record:

recommendedProducts
  A list/array of record objects with ``sku`` and a ``data`` map with the product-data fields ``title``, ``image``, ``brand`` and ``link``.
scopes
  Optional list of "scopes", which can be categories, brands or other relavant refinement to the according suggestion. For example "jeans" could come with the scopes "for women" and "for men".
  If searchHub does not deliver that data or "scope expansion" is activated on searchHub side, this list is always null.

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


V4 Request
^^^^^^^^^^

.. warning::

    This endpoint is only available if you are using the ``commerceexperts/searchhub-integration-service``, since it will use the smartQuery module to enrich the response.

This endpoint comes handy when you want to do a low latency frontend integration, that should fetch the smartQuery mapping while the user still types into suggest.
Actually that's exactly what the `Javascript Client`_ does and why it depends on that exact endpoint.

.. code-block:: bash

  http://<host>:<port>/smartsuggest/v4/<tenant-name>/<tenant-channel>?userQuery=<user-query>[&limit=<n>][&sessionId=<SearchCollectorSession>]

**Request Parameters**:

    - tenant-name (path): the first part of the tenant provided by searchHub
    - tenant-channel (path): the second part of the tenant provided by searchHub
    - userQuery (query): the text the user entered in the search box
    - limit (query): This parameter will limit the amount of returned suggestions. By default if omitted, the limit is set to 10.
    - sessionId (query): This optional parameter improves the integration of smartQuery. See the according `Integration with sessionId`_ section for details.

**Response**:

The response is a JSON object consisting of a 'suggestions' array similar to v3 and a 'mappingTarget' object as described in the `smartQuery integration`_

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
