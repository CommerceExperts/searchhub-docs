Setup
=====

smartQuery module is delivered as a Java Library. If you’re running on Java, it is recommended to integrate it directly into your search infrastructure.

The HTTP/REST headless service is available for all other platforms or when external proprietary code is restricted. Delivered as public Docker image, it can be deployed on-premise or hosted by searchHub as a service. For optimal performance, we recommend running the service on-premise to minimize latency. The simple JSON API can be easily integrated using a generated OpenAPI client, a custom-built HTTP client, or one of our in-house clients.

Requirements
------------

- Be sure the application is allowed to connect to the following HTTPS endpoints: ``https://query.searchhub.io/`` and ``https://import.searchhub.io/``
- In case fuzzy mapping is activated (true by default), running the library/service on better CPU is recommended. We are able to enable/disable fuzziness from our end during runtime, in case there should be any performance issues.
- The amount of memory heavily relies on the amount of data we get and preprocess for you. However due to the high efficient data structure, even a model with over 500k entries only needs around 300MB memory. The easiest way to find out the required memory for your system is to measure the initialized footprint.

Depending on the chosen integration type, these are additional requirements:

.. tabs::

   .. tab:: Java Integration

    - The runtime environment must be able to verify Let's Encrypt certificates
    - Java version >= 17
    - Memory: at least 100MB additional Java Heap space + more space depending on the amount of data to manage

   .. tab:: HTTP Service

    - Container runtime environment (docker, kubernetes, etc.)
    - Memory: at least 200MB + more space depending on the amount of data to manage


Installation
------------

Our continuous implementation build pushes the library into our own Maven repository and builds the according docker image right afterwards.

.. tabs::

    .. tab:: Java Integration

      Add smartQuery as dependency to your project.

      .. code-block:: XML

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

    .. tab:: HTTP Service (docker)

      .. code-block:: bash

        docker pull commerceexperts/smartquery-service:${SMARTQUERY_VERSION}

      The container must be initiated with your API key set to the environment variable `SH_API_KEY`.
      The container exposes port 8081 which can be mapped to any port.

      .. code-block:: bash

        docker run -d --name=smartquery-service -e SH_API_KEY=<YourS3cr3tAPIkey> -P commerceexperts/smartquery-service:${SMARTQUERY_VERSION}

      **Troubleshooting**

          - The container won't start, if you forget to specify the API key.
          - Should you attempt to access a non-permitted tenant/channel (due to an incorrect API key, for example), you will see an error message similar to: `update failed: FeignException: status 403 reading QueryApiTarget#getModificationTime(Tenant); content: {"message":"Invalid authentication credentials"}`
          - Enable debug logging, in order to obtain more information concerning internal activities. Activate this using the following docker startup parameter `-e JAVA_OPTS="-Dlog.searchhub.level=DEBUG"`

    .. tab:: PHP Client

      See the 'HTTP Service' tab about how to start the docker container.
      Then to use the HTTP Service in a PHP environment you can use our public `PHP Client`_ from ``https://github.com/CommerceExperts/searchhub-php-client``.
      You will find several code samples through the documentation using that PHP Client.

      .. code-block:: json

        {
          "require": {
            "commerce-experts/searchhub-php-client": "1.0.0"
          }
        }

    .. tab:: JS Client

      In case you request a search-vendor API directly from the frontend of your shop or from a Node JS backend, feel free to use our `searchHub JS Client`_ from
      ``https://github.com/CommerceExperts/searchhub-js-client``.

      For example install it via :code:`npm i -S searchhub-js-client`



Client Setup
------------

What you need for the first code to work:

    - Your API Key
    - The tenant name and channels that you can use (here we use "example.com")
    - some sample queries that lead to different outcomes. You might get some from us, otherwise look up some common misspellings with your account at ``my.searchhub.io``.
      (In the examples here we assume "jeanss" to be mapped to "jeans".)

Next you have to choose where to use smartQuery inside your application.
Somewhere in your (backend) architecture there is place where the users query is either directly forwarded to a search engine endpoint or transformed into a technical query for your
search engine (e.g. Elasticsearch, Solr). You should request smartQuery for a :code:`QueryMapping` before that processing starts, so that the user query can be replaced
or other instructions can be processed.

Keep in mind that after initializing smartQuery, there is an asynchronous process running in the background that fetches the first data.
It needs several seconds until the data actually responds. For testing you can make this process blocking, but for production it should stay exactly like that.

.. tabs::

    .. tab:: Java Integration

        The key class at the Java integration is the :code:`QueryMapperManager`. It is responsible for initializing and managing the QueryMappers for one or more Tenants.
        It needs to be instantiated with the provided API key.
        It's *important* to use a single `QueryMapperManager` object since it will internally spawn and manage several threads to update the `QueryMapper` instances asynchronously,
        and retain a reference to it.

        .. code-block:: java

            // should be centrally managed, e.g. a singleton bean in application context
            private final static QueryMapperManager qmManager;
            static {
                qmManager = QueryMapperManager.builder()
                                              .apiToken("YourS3cr3tAPIkey")
                // preload will make the 'build' call to block until the data is loaded
                                              .preloadTenants("example.com")
                                              .build();
                // The Javadoc of the QueryMapperManager::builder methods
                // tell you more about the available settings.
            }

            public void searchProcess(HttpServletRequest req, HttpServletResponse resp)
            {
                // init search process...
                Tenant tenant = new Tenant("example", "com");
                QueryMapper qm = qmManager.getQueryMapper(tenant);

                String searchQuery = req.getParameter("q");

                // in case the session-id of the searchHub collector is given, it should be used here.
                // If not, stick with 'null' because a different session leads to unwanted results!
                String shCookie = req.getCookieValue("SearchCollectorSession");
                QueryMapping mapping = qm.mapQuery(searchQuery, shCookie);
                if (mapping.hasRedirect()) {
                    resp.setHeader("Location", mapping.getRedirect());
                    resp.setStatus(302);
                    return;
                } else {
                    searchQuery = mapping.getSearchQuery();
                }

                // continue with search process...
            }

            // Optionally bind the qmManager instance to your JVM's lifecycle
            // and close the QueryMapperManager during shutdown.
            // Internally a ScheduledExecutorService is used, that will be stopped then.
            @PreDestroy
            public void onJvmShutdown() {
                qmManager.close();
            }

        .. note::
            The API Key and the preload tenants are automatically populated with the same environment variables as the HTTP service:
            If the environment variable `SH_API_KEY` is available, the API Key is set to it. Same for `SH_INIT_TENANTS` that adds tenants to the list of preloaded tenants.
            In that case you can simple use :code:`QueryMapperManager.builder().build()`


    .. tab:: HTTP Service (curl)

      If you have the service started, use the known tenant data and a sample user query to fetch a query mapping.

      .. code-block:: bash

        $> port=10240
        $> tenant_name="example"
        $> tenant_channel="com"
        $> curl "http://localhost:$port/smartquery/v2/$tenant_name/$tenant_channel?userQuery=$userQuery" -o - | jq .
         >  {
         >     "userQuery": "jeanss",
         >     "masterQuery": "jeans",
         >     "redirect": null,
         >     "potentialCorrections": null,
         >     "relatedQueries": null,
         >     "resultModifications": null,
         >     "successful": true,
         >     "searchQuery": "jeans"
         >  }


    .. tab:: PHP Client

      The PHP Client comes with the ability to run in several modes. But here we configure it to run connected to a local HTTP service.

      .. code-block:: php

        $tenant_name = "example";
        $tenant_channel = "com";
        $userQuery = "jeanss";

        $config = new Config($tenant_name, $tenant_channel, null, null,
            "http://localhost:$port/smartquery/v2/{$tenant_name}/{$tenant_channel}");
        $client = new SearchHubClient($config);
        $queryMapping = $client->mapQuery($userQuery);


    .. tab:: JS Client

      The JS Client comes only with the ability to connect to a SaaS Service so far. Therefor only tenant name is required for initialization.
      However additional it comes with the ability to do the splitting for an A/B test that can be evaluated by searchHub. Set this value to `false` unless other communicated.

      .. code-block:: javascript

        import {BrowserClientFactory} from "searchhub-js-client";

        const {smartSuggestClient, smartQueryClient, abTestManager} = BrowserClientFactory({
            tenant: "example.com",
            abTestActive: false
        });

        // automatically respects ab test assignment + caching
        const mapping = await smartQueryClient.getMapping("jeanss");

      More code examples are available in the `clients repository <https://github.com/CommerceExperts/searchhub-js-client>`_.

Now that you can fetch a QueryMapping, head over to the `integration`_ section to learn what to do with the different data retrievable by smartQuery.




.. _PHP Client: https://github.com/CommerceExperts/searchhub-php-client
.. _searchHub JS Client: https://github.com/CommerceExperts/searchhub-js-client
.. _integration: integration.html
