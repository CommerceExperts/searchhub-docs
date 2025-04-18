Setup
=====

smartSuggest is a library that utilizes Apache Lucene to generally achieve good suggest results. You can use that Java library directly to build your custom suggest service,
but it also comes packed as a HTTP service in form of a container image.

Requirements
------------

- Be sure the application is allowed to connect to ``https://query.searchhub.io/``. This is where it fetches the searchHub suggest data.
- The embedded Lucene library creates several indexes in a temporary directory. Make sure it is able to write to your OS temp directory. That data is volatile and does not need any
  permanent persistence. Inside the container this should work without any further intervention.
- Around 100MB to 500MB of Memory / Java Heapspace. Depending on the amount of data to be managed by the service it might be more.
- For Java integration please use at least JDK 17


Installation
------------

Our continuous implementation build pushes the library into our own Maven repository and builds the according docker image right afterwards.

.. tabs::

    .. tab:: HTTP Service (docker)

      The docker image is available on docker hub with the name `commerceexperts/searchhub-smartsuggest-service <https://hub.docker.com/r/commerceexperts/searchhub-smartsuggest-service/tags>`_

      .. code-block:: bash

        docker run -d --name=smartsuggest-service -e SH_API_KEY=<YourS3cr3tAPIkey> -P commerceexperts/searchhub-smartsuggest-service:${SMARTSUGGEST_VERSION}

      The container must be initiated with your API key set to the environment variable `SH_API_KEY`.
      The container exposes port 8081 which can be mapped to any port.

    .. tab:: Java Integration

        The basic smartSuggest library is part of the Open-Commerce-Search stack, therefor the dependency is ``de.cxp.ocs::smartsuggest-lib``.
        In order to load the searchHub data, our ``searchhub-suggest-data-provider`` must be added to the classpath as well.
        All related components can be pulled as a maven dependency from `our repository <https://nexus.commerce-experts.com/content/repositories/searchhub-external/>`_

        .. code-block:: XML

            <dependency>
                <groupId>de.cxp.ocs</groupId>
                <artifactId>smartsuggest-lib</artifactId>
                <version>${OCS_SUGGEST_LIB_VERSION}</version>
            </dependency>
            <dependency>
                <groupId>io.searchhub</groupId>
                <artifactId>searchhub-suggest-data-provider</artifactId>
                <version>${SMARTSUGGEST_VERSION}</version>
            </dependency>

            <!-- ... -->

            <repository>
                <id>external-releases</id>
                <url>https://nexus.commerce-experts.com/content/repositories/searchhub-external/</url>
            </repository>

        The full embedded integration is described at the `Java Integration`_ section.


Client Setup
------------

.. tabs::

    .. tab:: HTTP Service (curl)

      For a pure Suggest integration, we recommend to use endpoint v3. But there are more different ones that might fit better to your needs. Continue reading the `Service Integration`_ for all according details.

      .. code-block:: bash

        $> port=38081
        $> tenant_name="example"
        $> tenant_channel="com"
        $> curl -s "http://localhost:$port/smartsuggest/v3/$tenant_name/$tenant_channel?userQuery=jea" -o - | jq .

    .. tab:: Java

        This is a quick start for setting up a minimal ``QuerySuggester``. Read the full `Java Integration`_ for all details.

        .. code-block:: java

            static QuerySuggestManager qsm;
            static {
                try {
                    // as the 'searchhub-suggest-data-provider' is loaded via the Java SPI system
                    // you cannot configure it directly. The required settings have to be set as
                    // system properties (Setting them directly is not recommended, we just do it for
                    // demonstration purposes)
                    System.setProperty("searchhub.apikey", "123abc");
                    System.setProperty("searchhub.tenant_mappings", "example=example.com");

                    qsm = QuerySuggestManager.builder()
                            // required for lucene where it puts the index files
                            .indexFolder(Files.createTempDirectory("smartsuggest"))
                            // force synchronous indexation (optional)
                            .preloadIndexes("example.com")
                            .build();
                }
                catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            }

            private List<String> suggestQueries(String userQuery, int maxSuggestions) throws IOException {
                return qsm.getQuerySuggester("example")
                        .suggest(userQuery, maxSuggestions, Collections.emptySet())
                        .stream()
                        .map(suggestion -> suggestion.getLabel())
                        .collect(Collectors.toList());
            }

    .. tab:: JS Client

      The JS Client comes only with the ability to connect to a SaaS Service so far. Therefor only tenant name is required for initialization.
      However additional it comes with the ability to do the splitting for an A/B test that can be evaluated by searchHub. Set this value to `false` unless other communicated.

      .. code-block:: javascript

        import {BrowserClientFactory} from "searchhub-js-client";

        const {smartSuggestClient, smartQueryClient, abTestManager} = BrowserClientFactory({
            tenant: "example.com",
            abTestActive: false
        });

        const suggestions = await smartSuggestClient.getSuggestions("jea");

      More code examples are available in the `clients repository <https://github.com/CommerceExperts/searchhub-js-client>`_.


Troubleshooting
----------------

  - If you forgot to specify the API key, the container will stop with the log message
    `"IllegalArgumentException: no searchHub API key provided! Either specify ENV var 'SH_API_KEY' or system property 'searchhub.apikey'"`
  - In case you tried to access a non-permitted tenant/channel (maybe because you specified the wrong API key), you will see such a message in the logs of the service:
    `Unauthorized while fetching data for tenant 'foo.bar': [401 Unauthorized]`
  - To get more information about the internal processes, enable debug log. Do that with the docker startup parameter :code:`-e JAVA_OPTS="-Dlog.searchhub.level=DEBUG"` or for more debug messages additionally :code:`-Dlog.root.level=DEBUG`.


.. _tenant: ../glossary.html#tenant
.. _Micrometer: https://micrometer.io/docs
.. _Java Integration: java-integration.html
.. _Service Integration: service-integration.html
