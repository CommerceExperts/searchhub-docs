Service Integration
===================

.. note::

    This is the recommended way to integrate suggest, as the service can be directly consumed from your frontend!

    The `Java integration`_ is only recommended in the case you want to combine it with your existing suggest service or extend the suggest service with more custom data source. And of course it's only possible if your service is running inside a JVM environment.


API
---

The suggest service comes with several endpoints, that give you a different level of detail.
The suggestions themselves are all the same, just the structure or the meta data attached to the suggestions will differ.

Keep in mind, that smartSuggest starts fetching the necessary data, after the first request for a tenant was received. So the first few seconds all requests will return an empty result. A few seconds later you should get suggestions (if API Key is correctly set and the used tenant is correct).
It's possible to lower that startup latency by specifying the tenants using the preloadTenants parameter (SH_INIT_TENANTS), which is described below.

V1 Request
^^^^^^^^^^

This endpoint will deliver the suggestions grouped into blocks. Each block represents a different quality of suggestions depending on how they matched. This might be useful if you want to restrict the list to only the best matching suggestions.

.. code-block:: bash

  http://<host>:<port>/smartsuggest/v1/<tenant-name>/<tenant-channel>?userQuery=<user-query>[&limit=<n>]

**Request Parameters**:

    - tenant-name (path): the first part of the tenant provided by searchHub
    - tenant-channel (path): the second part of the tenant provided by searchHub
    - userQuery (query): the text the user entered in the search box
    - limit (query): This parameter will limit the amount of returned suggestions. By default if omitted, the limit is set to 10.

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


V2 Request
^^^^^^^^^^

This endpoint is for the simplest integration, as it will just deliver an array of strings. No grouping, no meta data. Just queries as strings. This is useful if you want a simple integration without any sophisticated feature.

.. code-block:: bash

  http://<host>:<port>/smartsuggest/v2/<tenant-name>/<tenant-channel>?userQuery=<user-query>[&limit=<n>]

**Request Parameters**:

    - tenant-name (path): the first part of the tenant provided by searchHub
    - tenant-channel (path): the second part of the tenant provided by searchHub
    - userQuery (query): the text the user entered in the search box
    - limit (query): This parameter will limit the amount of returned suggestions. By default if omitted, the limit is set to 10.

**Response**:

The response is a JSON array with simple strings that can be used as autocompletion result.

.. code-block:: json

  [
    "suggestion 1",
    "suggestion 2",
    "etc."
  ]


V3 Request
^^^^^^^^^^

This endpoint delivers a list of suggestions, where each suggestion is a rich object that also has some meta data attached to it.

.. code-block:: bash

  http://<host>:<port>/smartsuggest/v3/<tenant-name>/<tenant-channel>?userQuery=<user-query>[&limit=<n>]

**Request Parameters**:

    - tenant-name (path): the first part of the tenant provided by searchHub
    - tenant-channel (path): the second part of the tenant provided by searchHub
    - userQuery (query): the text the user entered in the search box
    - limit (query): This parameter will limit the amount of returned suggestions. By default if omitted, the limit is set to 10.

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

.. code-block:: json

  [
    {
      "payload": {
        "meta.matchKey": "suggestion1",
        "meta.matchGroupName": "best matches",
        "meta.weight": 10234,
        "type": "keyword"
      },
      "suggestion": "suggestion1"
    },
    {
      "payload": {
        "meta.matchKey": "suggestion2",
        "meta.matchGroupName": "best matches",
        "meta.weight": 10109,
        "type": "keyword",
        "redirect": "https://some-redirect-url.com",
      },
      "suggestion": "suggestion2"
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
          "suggestion": "suggestion a1"
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
