Direct Integration
==================

Requirements
------------

- Java version >= 11
- approximately, 120MB to 300MB additional Java Heapspace (depending on the amount of data to be managed)
- If a firewall is used, it needs to be configured to allow connections to the following HTTPS Endpoints https://query.searchhub.io/ and https://import.searchhub.io/

Maven Dependency
----------------

The smartQuery library can be pulled as a maven dependency from our private repository https://nexus.commerce-experts.com/content/repositories/searchhub-external/.

::

    <dependency>
        <groupId>io.searchhub</groupId>
        <artifactId>smartquery</artifactId>
        <version>${SMARTQUERY_VERSION}</version>
    </dependency>
    
    <!-- ... -->
    
    <repository>
        <id>external-releases</id>
        <url>https://nexus.commerce-experts.com/content/repositories/searchhub-external/</url>
    </repository>


Essential Usage
---------------

The library contains the following three central types:

Tenant
  Simple POJO that represents a single data domain. (See the `glossary`_ about what a `Tenant`_ is.)
  

QueryMapper
  The central component provided by the smartQuery library is the `QueryMapper`. It provides query mappings with the `mapQuery` method.

  :QueryMapping mapQuery(String input):
  
    This method returns a query mapping, with the original user query, a mapped query and an optional redirect URL. A `QueryMapping` has some convenient methods to handle redirects and queries accordingly - please refer to the Javadoc.

QueryMapperManager
  This class is responsible for initializing and managing the QueryMappers for the required Tenants. It needs to be instantiated with the provided API key [3]_. 
  It's *important* to use a single `QueryMapperManager` object, since it will internally spawn and manage several threads to update the `QueryMapper` instances asynchronously, and retain a reference to it. 
  If no longer needed, the `close` method should be called, to stop the internal update threads.
  
  :QueryMapper getQueryMapper(Tenant t):
  
    The `getQueryMapper` method will always return the same instance of `QueryMapper` for the same given `Tenant`. As a result, it's not necessary to keep a reference of the `QueryMapper`. However, keeping a reference of a `QueryMapper` instance isn't a problem, since each `QueryMapper` will be updated in the background.
    
    A non-existing tenant won't cause an error but simply return a QueryMapper which always returns `null`.


.. note::
    The API Key and the preload tenants are automatically populated with the same environment variables as the REST-service:
    If the environment variable `SH_API_KEY` is available, the API Key is set to it. Same for `SH_INIT_TENANTS` that adds tenants to the list of preloaded tenants.

.. [3] We will provide you with a personal API Key.


Usage Example
-------------

  .. code-block:: java

    private QueryMapperManager qmManager = QueryMapperManager.builder()
                                             .apiToken("YourApiKey")
                                             .updateRate(360)               // optional
                                             .preloadTenants("example.com") // optional
                                             .build();

    public void searchProcess(HttpServletRequest req, HttpServletResponse resp)
    {
        // init search process...

        Tenant tenant = new Tenant("example", "com");
        QueryMapper qm = qmManager.getQueryMapper(tenant);
        
        String searchQuery = req.getParameter("q");

        // in case the session-id of the searchHub collector is given, it should be used here. 
        // If not, stick with 'null', because a different session leads to unwanted results!
        QueryMapping mapping = qm.mapQuery(searchQuery, req.getCookieValue("SearchCollectorSession"));
        if (mapping.hasRedirect()) {
            resp.setHeader("Location", mapping.getRedirect());
            resp.setStatus(302);
            return;
        } else {
            searchQuery = mapping.getSearchQuery();
        }

        // continue with search process...
    }
    
    // It's recommended to bind the qmManager instance to your JVM's lifecycle
    // and close the QueryMapperManager during shutdown.
    // Internally a ScheduledExecutorService is used, that will be stopped then.
    @PreDestroy
    public void onJvmShutdown() {
        qmManager.close();
    }

The Javadoc of the :code:`QueryMapperManager.builder()` methods tell you more about the available settings.


Integration with sessionID
--------------------------

If our `search collector`_ is integrated into the frontend of your system, it is recommended to pass the corresponding sessionId to smartQuery.
This sessionId is used for clusters with queries under test to distribute the search traffic evenly between both queries.
Without the sessionId, the informative value and success rate of these tests are lower.

For implementation, the value of the :code:`SearchCollectorSession` cookie *MUST* be used. Using a different sessionId will lead to unexpected results.
If the :code:`SearchCollectorSession` cookie does not exist or is not provided for a request, pass 'null' instead.


Monitoring
----------

smartQuery optionally exposes internal metrics using the `Micrometer`_ framework. If you'd like to receive these metrics, add the desired Micrometer connector to your dependencies, as well as, the MeterRegistry implementation.

  .. code-block:: java

    // ...
    MeterRegistry meterRegistry = getYourMeterRegistryInstance();
    
    // example: to expose metrics over JMX create a JmxMeterRegistry 
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
        The stats-collector's bulk size metrics describe, how large the bulks are that were sent to the searchHub stats API. 
        With :literal:`sum/count` the average size can be calculated. Max is the biggest bulk since application start.

    smartquery.statsCollector.fail.count.total
        The total amount of failed transmissions, that were reported to the stats API.

    smartquery.update.fail.count
        The number of successive failed mapping update attempts for a certain tenant. If an update succeeds, this value will be reset to "0".
        If this value reaches "5", that update process will be stopped and only started again, if mappings for the respective tenant are requested again.
        This metric is tagged with the appropriate `tenant_name` and `tenant_channel`.
        
    smartquery.update.success.count.total
        The total number of successful data updates per tenant.
        This metric is tagged with the respective `tenant_name` and `tenant_channel`.

    smartquery.mappings.size
        The current number of raw mapping pairs per tenant.
        This metric is tagged with the respective `tenant_name` and `tenant_channel`.
        
    smartquery.mappings.age.seconds
        Time passed, since the last successful mapping update.
        This metric is tagged with the respective `tenant_name` and `tenant_channel`.

    
.. _Ingestion: ingestion.html
.. _glossary: ../glossary.html
.. _tenant: ../glossary.html#tenant
.. _Micrometer: https://micrometer.io/docs
.. _search collector: search-collector.html
