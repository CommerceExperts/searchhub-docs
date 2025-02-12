Integration Details
===================


QueryMapping
------------

The object returned by the QueryMapper contains all information to change the search result. The main focus is to change the natural query that is processed by the search engine.
That's the so-called 'masterQuery'. In case there is no masterQuery, the original user query should be used for search. To avoid null-checks, there is the 'searchQuery' property
that will always contain the correct query.

Additional the QueryMapping contains more properties that can be used to further improve the result for the user.

  - `redirect`: URL to a landing page. If given, the search process can be stopped and the user can be redirected to the according URL.
  - `potentialCorrections`: An optional array of 1 or 2 queries that could be a correction to the given query. They are given in case no reliable masterQuery could be found
    and should be shown to the user as possible alternative queries.
  - `relatedQueries`: An optional list of queries that are related to the user input. They can be used as inspiring queries next to the search result.
  - `resultModifications`: An optional list of up to four different list types, each describing how the initial search result should be modified. Each modification type is paired with a list of corresponding IDs (docIDs).


Redirect
~~~~~~~~

At searchHub search managers have the ability to add redirect URLs for certain search intends. That can be redirects to category pages, filtered or sorted search results or other arbitrary sites in the shop. If a ``redirect`` is given, it should take precedence over the normal search. In fact, you can spare the request to the search engine, saving cost and time.

Normally the provided redirect URL comes as a full qualified URL. That way you can also validate if this is a redirect inside the shop. However, we can also provide relative URLs.
That's helpful if you have the same URL structures in different stages and want them to work in all of them.
To achieve that, please let us know about your URL structures, we then adjust the exported URLs accordingly.


Potential Corrections
~~~~~~~~~~~~~~~~~~~~~

To implement the `user story about potential corrections <user-stories.html#potential-correction-alternatives>`_ you should use the queries given with the ``potentialCorrections`` property.
It's a string array of one or more elements in case no certain mapping is available.
Along with a potential search result it should be presented to the user as alternative queries, maybe embedded into some feedback text like "*Did you mean '${potentialCorrections[0]}'*".

A click on one of those queries should cause a new search request and can lead to an improved search result. In combination with our searchCollector tracking, we gather accepted corrections and may automatically improve future requests of those corrected queries.


Related Queries
~~~~~~~~~~~~~~~

Users often enter broad queries, generating extensive search results that require filtering to find more specific results.
Related queries offer an alternative way to guide users toward more specific and relevant results.

Additionally, related queries can help when a search is too specific and should be broadened.
For example, the query "women's black trousers" might be relaxed to "women's trousers" by omitting the color term.

Whenever related queries are available for a user’s search, you can present them as suggestions for further exploration.
The "relation" property can be useful for filtering related queries or determining how to present them.

    .. code-block:: json

        {
            "userQuery": "bathroom",
            "relatedQueries": [
                {"relation": "sharpened", "query": "bathroom furniture"},
                {"relation": "sharpened", "query": "bathroom supplies"},
                {"relation": "alternative", "query": "bath"}
            ]
        }

Since the list of related queries may exceed the available display space, feel free to limit the number shown to the user.

These are the different available *relation* types:

    - *sharpened*: The related query is more specific than the user query
    - *relaxed*: The related query is less specific than the user query
    - *alternative*: The related query is different to the user query and might be synonym or hyponym


Result Modifications
~~~~~~~~~~~~~~~~~~~~

With our Neural-Infusion approach we are able to provide additional products to the ones delivered by your search engine. Also due to detailed tracking we know about low performing products or products that are not relevant at all for a given query. This information is given to you trough the ``resultModifications`` property: A list of product sets that should be added or removed to the generated result.

**Example**

    .. code-block:: json

        {
            "userQuery": "jeans",
            "resultModifications": [
                {"modificationType": "Pin", "ids": ["100012", "100049", "100139"]},
                {"modificationType": "Add", "ids": ["100472", "100202", "100387"]},
                {"modificationType": "Penalize", "ids": ["100355"]}
            ]
        }

In this example 3 products should be "pinned" to the top of the result, 3 more products should be added and submerged into the result and 1 product should get a penalty to not show up in the top results.

These are the available resultModification types:

    - **Add**: The specified IDs should be inserted into the result at any position during result generation, allowing them to be discovered through scrolling, filtering, or sorting..
    - **Remove**: Products with the specified IDs should be excluded from the result, if present. This should occur during result generation to ensure accurate facet filtering.
    - **Pin**: The specified product IDs should be included in the result and placed at the top.
    - **Penalize**: The specified products should receive a score reduction, pushing them toward the end of the result.

In the best case, your search engine is be able to perform those modifications during result generation, so those changes are already reflected in the filter facets.
In the rather suboptimal case, you have to filter or insert those products artificially in the returned result. Please reach out to us for integration help with your search engine.
In the following example queries we show how it could be done with common open source engines.

Adding Products
***************

.. tabs::

    .. tab:: Solr

      This request type allows you to search for documents that match either your query or a list of document IDs.

      .. code-block:: sh

        q=your_field:search term OR id:(id1 id2 id3)

    .. tab:: Elasticsearch / OpenSearch

      The should clause allows you to search for documents that match either your query or a list of document IDs.
      The terms query filters documents by the specified list of document IDs. In case your document IDs don't match the product IDs, use the according field.

      .. code-block:: json

        {
          "query": {
            "bool": {
              "should": [
                {
                  "match": {
                    "your_field": "search term"
                  }
                },
                {
                  "terms": {
                    "_id": ["id1", "id2", "id3"]
                  }
                }
              ]
            }
          }
        }


Pinning Products
****************

Pinning goes beyond adding products. Those products should be shown at the very beginning of your result.

.. tabs::

    .. tab:: Solr

      To achieve prioritization of specific document IDs in Solr use the `Query Elevation Component <https://solr.apache.org/guide/solr/latest/query-guide/query-elevation-component.html>`.
      It provides the 'elevateIds' parameter that allows you to specify document IDs that should be prioritized in the search results.
      In this case, id1, id2, and id3 will receive a boost and appear higher in the results.

      .. code-block:: sh

        q={!edismax qf=your_field}search term&elevateIds=id1,id2,id3

    .. tab:: Elasticsearch

      If you want the documents found by _id to be prioritized over those that match the query, you can use a `pinned query <https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-pinned-query.html>`:

      .. code-block:: json

        {
          "query": {
            "pinned": {
              "ids": [ "id1", "id2", "id3" ],
              "organic": {
                "match": {
                  "your_field": {
                    "query": "search term"
                  }
                }
              }
            }
          }
        }

    .. tab:: Opensearch

      As of now, Opensearch does not support pinned query. You can achieve similar results by boosting the according products with a high boosting value for example by using
      a query-string query.

      .. code-block:: json

        {
          "query": {
            "bool": {
              "should": [
                {
                  "match": {
                    "your_field": "search term"
                  }
                },
                {
                  "query_string": {
                    "query": "id1^10000 id2^9999 id3^9998",
                    "default_field": "_id",
                    "default_operator": "OR"
                  }
                }
              ]
            }
          }
        }


Removing Products
*****************

Products with the specified IDs should be excluded from the result, if present. This should occur during result generation to ensure accurate facet filtering.

.. tabs::

    .. tab:: Solr

      To achieve exclusion of specific document IDs in Solr using the excludeIds request parameters, you can do the following:

      .. code-block:: sh

        q={!edismax qf=your_field}search term&elevateIds=id1,id2,id3&excludeIds=id1,id2,id3

      This parameter specifies document IDs that should be excluded from the search results entirely. Here, id1, id2, and id3 will be removed from the results even if they match the search term.


    .. tab:: Elasticsearch / OpenSearch

      If you want to exclude the documents matched by _id from the final search results, you can achieve this by using a combination of must_not clause within your query.
      This ensures that documents found by _id are removed from the final set of results, while still running your main query.

      .. code-block:: json

        {
          "query": {
            "bool": {
              "must": [
                {
                  "match": {
                    "your_field": "search term"
                  }
                }
              ],
              "must_not": [
                {
                  "terms": {
                    "_id": ["id1", "id2", "id3"]
                  }
                }
              ]
            }
          }
        }


Penalizing Products
*******************

Products with the specified IDs should get a score penalty to went down in the result order.

.. tabs::

    .. tab:: Solr

      To achieve a penalty of specific document IDs in Solr, the boost query can be used with a negated query. Basically all other documents get boosted but the ones listed.

      .. code-block:: sh

        defType=edismax&q=search term&fl=id,score&boost={!func}if(not(query({!lucene v='id:(id1 OR id2 OR id3)'})),10,1)


    .. tab:: Elasticsearch / OpenSearch

      You can use the boosting query (`ES docs <https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-boosting-query.html>`_ / `OS docs <https://cwillum.github.io/query-dsl/compound/boosting/>`_) to wrap your standard query into the "positive" clause while adding a terms query with the penalized products into the "negative" clause.

      .. code-block:: json

        {
          "query": {
            "boosting": {
              "positive": {
                "match": {
                  "your_field": "search term"
                }
              },
              "negative": {
                "terms": {
                  "_id": ["id1", "id2", "id3"]
                }
              },
              "negative_boost": 0.5
            }
          }
        }

      The 'negative_boost' value is multiplied with the score of the positive query for the products matching the negative query.


Integration with sessionID
--------------------------

If our `search collector`_ is integrated into the frontend of your system, it is recommended to pass the corresponding sessionId to smartQuery.
This sessionId is used for clusters with queries being tested to distribute the search traffic evenly between both queries.
Without the sessionId, the informative value and success rate of these tests are lower.

For implementation, the value of the :code:`SearchCollectorSession` cookie *MUST* be used. Using a different sessionId will lead to unexpected results.
If the :code:`SearchCollectorSession` cookie does not exist or is not provided for a request, pass 'null' instead.

More information about this extended integration is in the `best practices`_ section.



Instrumenting
-------------

.. note::
    The REST service exposes those metrics per default (see listing below). Only at the Java integration they have to be enabled explicitly.

smartQuery optionally exposes internal metrics using the `Micrometer`_ framework. If you'd like to receive these metrics, add the desired Micrometer connector to your dependencies, as well as the MeterRegistry implementation.

  .. code-block:: java

    // ...
    MeterRegistry meterRegistry = getYourMeterRegistryInstance();
    

    // Example: To expose metrics over JMX, create a JmxMeterRegistry 
    meterRegistry = new JmxMeterRegistry(JmxConfig.DEFAULT, Clock.SYSTEM);

    // and add it to the QueryMapperManager.builder afterwards
    queryMapperManagerBuilder.addMetricsRegistryAdapter(MeterRegistryAdapter.of(meterRegistry));

    // ...


Subsequently, you will be able to track the following metrics:

.. glossary::

    smartquery.statsCollector.queue.size
        The current number of items inside the transmission queue of the stats-collector.
        Since the queue size is limited to 500 entries per default, a higher value should never appear. Hitting this limit is an indicator of a broken connection to the stats API.

    smartquery.statsCollector.bulk.size.count
    smartquery.statsCollector.bulk.size.sum
    smartquery.statsCollector.bulk.size.max
        The stats-collector's bulk size metrics describe how large the bulks are that were sent to the searchHub stats API. 
        With :literal:`sum/count` the average size can be calculated. Max is the biggest bulk since the application started.

    smartquery.statsCollector.fail.count.total
        The total amount of failed transmissions, that were reported to the stats API.

    smartquery.update.fail.count
        The number of successive failed mapping update attempts for a certain tenant. If an update succeeds, this value will be reset to "0".
        If this value reaches "5", that update process will be stopped and only started again if mappings for the respective tenant are requested once more.
        This metric is tagged with the appropriate `tenant_name` and `tenant_channel`.

    smartquery.update.success.count.total
        The total number of successful data updates per tenant.
        This metric is tagged with the respective `tenant_name` and `tenant_channel`.

    smartquery.mappings.size
        The current number of raw mapping pairs per tenant.
        This metric is tagged with the respective `tenant_name` and `tenant_channel`.
        
    smartquery.mappings.age.seconds
        Time passed since the last successful mapping update.
        This metric is tagged with the respective `tenant_name` and `tenant_channel`.


.. _Ingestion: ingestion.html
.. _glossary: ../glossary.html
.. _tenant: ../glossary.html#tenant
.. _Micrometer: https://micrometer.io/docs
.. _search collector: search-collector.html
.. _best practices: best-practices.html
