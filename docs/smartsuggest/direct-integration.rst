Direct Integration
==================

Requirements
------------

- Java version >= 11
- around 100MB to 500MB additional Java Heapspace (depending on the amount of data to be managed by the service)
- If using a firewall, please adjust the configuration to allow connections to the following HTTPS Endpoints https://query.searchhub.io/ and https://import.searchhub.io/

Maven Dependency
----------------

The basic smartSuggest library is part of the Open-Commerce-Search stack. In order to load the searchHub data, our searchhub-suggest-data-provider must be added to the classpath.
All related components can be pulled as a maven dependency from our repository https://nexus.commerce-experts.com/content/repositories/searchhub-external/

.. code-block:: xml

    <dependency>
        <groupId>de.cxp.ocs</groupId>
        <artifactId>smartsuggest-lib</artifactId>
        <version>0.22.0</version>
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


Essential Usage
---------------

The QuerySuggester is the central object of the smartsuggest library. It is used to fetch the matching suggestions based on the (partial) user input.
To get access to a QuerySuggester object, a single QuerySuggestManager must be built and maintained as a central reference. 
This is important as the QuerySuggestManager instance takes care of updating the suggest data in case the data changes at the data-source.
It can also be used to shutdown any QuerySuggesters and therefore free related resources.

A QuerySuggester instance can be accessed from the QuerySuggestManager using an "index name" as a parameter.
The index name is the full `tenant`_ name used at searchHub. For example: "myshop.com".

Alternatively you can specify index name to tenant mappings via ENV variable "SH_TENANT_MAPPINGS" or system property "searchhub.tenant_mappings". 
Their value should be a comma separated list of key value pairs. Example: SH_TENANT_MAPPINGS="indexname=tenant.name,myshop=myshop.com"

To load the correct data, the update process must get your searchHub API key, which you will receive during searchHub onboarding.
This API key must be set either, as environment variable "SH_API_KEY" or, as system property "searchhub.apikey" within the Java environment.


Usage Example
-------------

.. code-block:: java

    static QuerySuggestManager qsm;
    static {
        try {
            // this should not be necessary, instead the API key should be set from
            // the outside of the java process
            System.setProperty("searchhub.apikey", "123abc");
            System.setProperty("searchhub.tenant_mappings", "example=example.com");

            qsm = QuerySuggestManager.builder()
                    // required for lucene where it puts the index files
                    .indexFolder(Files.createTempDirectory("smartsuggest"))
                    // force synchronous indexation (optional)
                    .preloadIndexes("example")
                    // the builder also has other options
                    .build();
        }
        catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    // It's recommended to bind the querySuggestManager instance to your JVM's lifecycle
    // and close the QueryMapperManager during shutdown.
    // Internally a ScheduledExecutorService is used, that will be stopped then.
    @PreDestroy
    public void onJvmShutdown() {
        qsm.close();
    }

    private List<String> suggestQueries(String userQuery, int maxSuggestions) throws IOException {
        return qsm.getQuerySuggester("example")
                .suggest(userQuery, maxSuggestions, Collections.emptySet())
                .stream()
                .map(suggestion -> suggestion.getLabel())
                .collect(Collectors.toList());
    }



The javadoc of the :code:`QuerySuggestManager.builder()` methods tell you more about the available settings.

The last parameter of type 'Set' (where at this example simply 'Collections.emptySet()' is passed) is there for filtering suggestions according to their tags. 
However the data from searchHub is not tagged yet, so any non-empty parameter will lead to 0 result. This feature is for later usage.

Options for QueryMapperManagerBuilder
-------------------------------------

When building a QuerySuggestManager - the central object that build and holds the QuerySuggest instances for all indexes,
there are several options that can be set to change the default behaviour:

.. code-block:: java

    QuerySuggestManager querySuggestManager = QuerySuggestManager.builder()

        /**
         * Since the index directory is not cleaned up after index closing, it could be useful
         * to use the same directory all the time, so that existing files are reused and overwritten.
         * If this index folder is not specified, a random temporary folder is picked.
         */
        .indexFolder(Files.createDirectory(Path.of("/tmp/suggest-index-dir")))

        /**
         * To load indexes directly after initialization, specify them here
         */
        .preloadIndexes("my.tenant_1", "my.tenant_2")

        /**
         * Overwrite the default of 60 seconds update rate. Min = 5 / Max = 3600
         */
        .updateRate(120)

        /**
         * Attach a meter registry to the suggest manager and all QuerySuggester produced by it
         */
        .addMetricsRegistryAdapter(MeterRegistryAdapter.of(new JmxMeterRegistry(config, clock)))

        /**
         * Customize default configuration that is used as a basis for other configs provided by
         * a potential SuggestConfigProvider (that can be added via the standard java ServiceLoader)
         */
        .withDefaultSuggestConfig(SuggestConfig.builder().alwaysDoFuzzy(false).maxSharpenedQueries(5).build())

        /**
         * A custom SuggestDataProvider can either be injected using the standard java ServiceLoader mechanic
         * (declaring a implementation for de.cxp.ocs.smartsuggest.spi.SuggestDataProvider)
         * or by passing an instance directly to the builder. Do not use both mechanics, otherwise that
         * data-provider is loaded twice.
         **/
        .withSuggestDataProvider(mySuggestDataProvider)

        /**
         * Data provider configs are class specific, so the same config will be passed to each instance that has
         * data for a requested index.
         * If there should be two different data providers of the same class, make sure to pass individual parameters
         * during instance creation. The data provider config will be passed additionally.
         * This is useful for general connection settings for example.
         **/
        .addDataProviderConfig(mySuggestDataProvider.getClass().getCanonicalName(), singletonMap("my-setting", "value"))

        .build();

Custom Config
-------------

The simplest way is to set a static default configuration during :code:`QuerySuggestManager` setup by using the method :code:`withDefaultSuggestConfig`
and setting an object of type :code:`de.cxp.ocs.smartsuggest.spi.SuggestConfig`. It allows several changes about how the suggest
library will behave. All of them described in detail below.

Another possibility is the injection of a :code:`SuggestDataProvider` implementation using Java Service-Loader mechanic
(which is to have a file on classpath named :code:`META-INF.services/de.cxp.ocs.smartsuggest.spi.SuggestDataProvider` that contains
the full canonical class-name of the implementation that must also be on classpath and a no-args-constructor).
This option comes in handy when you have index-specific configuration or if you want to load configuration dynamically from an external
resource or database. That implementation is then asked for a configuration object everytime new data is loaded.

Here a full description of all configuration properties (the names in brackets are the for suggest.properties in case the standard
implementation SuggestServiceProperties is used)

    - locale (suggest.locale): the locale for a index to be used. Relevant for normalization of the indexed text.

    - alwaysDoFuzzy (suggest.always-do-fuzzy): if set to true, a fuzzy lookup is made even when some exact prefix-matches are found.
      This will increase the average lookup time and should only be done in case of bad data or many ambiguous matches.
      If not set, fuzzy-lookup are only done for input terms that don't match any text as an exact prefix.

    - sortStrategy (suggest.sort-strategy): can be one of 'PrimaryAndSecondaryByWeight' or 'MatchGroupsSeparated'
        - MatchGroupsSeparated: Suggestions are ordered by their match-group (sharpened, primary, secondary, fuzzy1, fuzzy2, etc).
          Within each group, matches are ordered according to "best match" (a combination of match-position and weight).
        - PrimaryAndSecondaryByWeight: Similar to MatchGroupsSeparated, but "primary" and "secondary" group are considered equal and merged.
          Within these first match groups, suggestions are only ordered by weight.

    - maxSharpenedQueries (suggest.max-sharpened-queries): Defines the limit of returned sharpened queries.
      Sharpened queries are queries that are injected directly (without requesting a Lucene index) from a hash-map if
      the input query matches one of the existing entries.
      This limit is only considered if there are more sharpened queries than defined by that limit.

    - isIndexConcurrently (suggest.concurrent-indexation): If set to false, the indexation of the received data will be done sequentially.
      This means it will take longer until the service is ready for usage and will spare computational power that might be used for others.

    - useDataSourceMerger (suggest.data-source-merger): boolean value that only is required if there are several data-sources. If set to true, those data is merged and
      indexed into one index. This could reduce load and improve performance since a single Lucene suggester is asked for results.
      However in such a case the weights should be in a similar range to avoid a proper ranking.

    - groupKey (suggest.group.key): With this setting it is possible to specify a key that is available in the payload of all provided suggestions.
      The final result list will then be grouped by this payload-value and truncated according to the provided group configs.
      It's recommended to use setGroupConfig as well, otherwise the default limiter will be used after grouping.

    - groupConfig (either 'suggest.group.share-conf' or 'suggest.group.cutoff-conf' if relative or absolute values should be used):
      An ordered list of string-integer tuples. Each string refers to a value of the group-key.
      It defines the amount of suggestions to return as a maximums for a single suggest-result-list,
      e.g. max 4 brand-suggestions and max. 6 category suggestions

    - useRelativeShareLimit (already reflected in the use of suggest.group.share-conf):
      This changes the meaning of the groupConfig values. If set to true the group-configs are used as relative share values,
      for example 20 and 80 are treated as 20% and 80%.

    - groupDeduplicationOrder (suggest.group.deduplication-order): Defines in which order similar suggestions from different "groups" are preferred.
      Names that appear first are preferred over names appearing later. This setting is 'null' per default, which means no
      deduplication is done at all. If an empty String[] is set, deduplication is done randomly.
      This only works, if the suggest service is configured with a grouping key.

    - prefetchLimitFactor (suggest.group.prefetch-limit-factor): If grouping and limiting is configured by a key that comes from a single or merged data-provider, then this value
      can be used to increase the internal amount of fetched suggestions.
      This is usable to increase the likeliness to get the desired group counts.


Adding Custom Data
------------------

The Suggest Library is build as service that takes care of updates on its own. So no external process is necessary to send data
to the Suggest Library. Instead a :code:`SuggestDataProvider` implementation is required, that encapsulates all the data loading.

Assume you have a database where your required data is managed and updated every now and then. Your :code:`SuggestDataProvider`
implementation needs to provide two pieces of information in advance:

  - Is there data for a given index?
  - What is the last time, this data was modified?

The modification time of your data is important, because the Suggest Library will only request the data itself, if it
is not indexed yet or if the indexed data is older than the indexed data. The check for new data is done every minute by default
and can be changed with the :code:`updateRate` setting. If there is no modification timestamp in your database, you can either
increase the :code:`updateRate` or manage a custom modification time inside your :code:`SuggestDataProvider` implementation that might
only be incremented every N hours.

When loading data, the :code:`SuggestDataProvider` implementation needs to produce all suggest records at once and provide a single
big :code:`SuggestData` object. Here an example what goes into that DTO:

.. code-block:: java

        SuggestData suggestDTO = SuggestData.builder()

                /**
                 * the type will be attached to every suggestion coming from this data provider
                 **/
                .type("product")

                /**
                 * the locale is used for several normalisation during index time are done
                 **/
                .locale(Locale.GERMAN)

                /**
                 * this is where the actual suggest records are loaded and passed to the DTO
                 **/
                .suggestRecords(loadSuggestions())

                /**
                 * The same timestamp has to be set here, as returned by `getLastDataModTime(String indexName)`
                 **/
                .modificationTime(getModificationTime())

                /**
                 * If available, it's also possible to add stop-words that will be ignored during indexing.
                 **/
                .wordsToIgnore(Set.of("this", "that"))

                .build();

Monitoring
----------

smartSuggest, optionally, provides internal metrics using the `Micrometer`_ framework. If you'd like to tap into those metrics, simply add the necessary Micrometer connector to your dependencies followed by, your desired MeterRegistry.

.. code-block:: java

    // ...
    MeterRegistry meterRegistry = getYourMeterRegistryInstance();
    
    // example: to reveal metrics over JMX create a JmxMeterRegistry 
    meterRegistry = new JmxMeterRegistry(JmxConfig.DEFAULT, Clock.SYSTEM);
    
    // and add it to the QueryMapperManager.builder afterwards
   QuerySuggestManager.builder()
      // ...
      .addMetricsRegistryAdapter(MeterRegistryAdapter.of(meterRegistry));
      // ...

You will be able to track the following metrics:

.. glossary::

    smartsuggest.update.success.count.total
        Total number of successful data updates per tenant.
        This metric is tagged with the corresponding `tenant_name` and `tenant_channel`.

    smartsuggest.update.fail.count
        Number of successive failed update attempts for a certain tenant. If an update succeeds, this value will be reset to "0".
        If this value reaches "5", the respective update process will be stopped and only restarted, if suggestions for the related tenant are requested again.
        This metric is tagged with the corresponding `tenant_name` and `tenant_channel`.
        
    smartsuggest.suggestions.size
        Current number of raw suggestion records per tenant.
        This metric is tagged with the corresponding `tenant_name` and `tenant_channel`.
        
    smartsuggest.suggestions.age.seconds
        That is the amount of time passed, since the last successful update took place.
        This metric is tagged with the corresponding `tenant_name` and `tenant_channel`.

    
.. _tenant: ../glossary.html#tenant
.. _Micrometer: https://micrometer.io/docs
