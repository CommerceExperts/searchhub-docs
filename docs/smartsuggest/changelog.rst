Changelog
=========

Version 2
---------
Version 2.6.0
    - Lib: Shade some partial used utility dependencies into library to reduce transitive dependencies
    - Implement and utilize multi-get for fetching suggest-products from payload-index
    - Replace Bloomfilter with faster XOR-filter for payload lookups
    - Fix potential NPE during cleanupMeters
    - Fix Class-Not-Found for missing AWS SDK when checking on s3-data-provider

Version 2.5.5
    - Fix grouping logic for different data sources

Version 2.5.4
    - Update dependencies
    - Fix NoSuchElementException from drained iterator for maxExpandScopes > 2
    - Fix NPE for missing context parameter
    - Fix version adapter errors for contextual suggestions

Version 2.5.3
    - Fix missing metrics
    - Fix application name and version reporting
    - Cleanup metrics for destroyed suggester even if shutdown failed

Version 2.5.2
    - Add info endpoint that exposes version
    - Reintroduce configurable management-endpoint prefix

Version 2.5.1
    - Update dependencies + fixing dependency version conflicts
    - Fix potential ConcurrentModificationException when loading many indexes at once

Version 2.5.0
    - Add product suggestions through searchHub data provider
    - Add scoped suggestions through searchHub data provider
    - Add contextual pre-suggestions through searchHub data provider

.. note::
    **Backward Compatibility**

    The REST-API is completely compatible to version 1, so a simple container update is all that's needed.
    If the Java-integration is used, please consider the according Migration Notes.


Version 2.0.0 - 2.4.0 (*not published*)
    - Embedded and improved ocs.smartsuggest
    - Get rid of memory consuming structures
    - Recovery from archive provider can use index name to recover additional data
    - Unify configuration handling, dropping legacy support
    - Replace searchhub-data-provider and s3-data-provider (optional) with index-archive-provider for faster startup times and reduced memory footprint
    - Add persistence-access-layer "PAL" to reduce redundant data storage
    - Prepared "magnetic labels": labels that automatically adjust to the user input
(These internal versions were part of a major refactoring, but not published as they did not contain any additional value and were just the preparation for version 2.5.0; also to get to a version that aligns with our API and other modules)

Version 1
---------
Version 1.4.2
    - Service migrated to undertow

Version 1.4.1
    - Update dependencies

Version 1.4.0
    - Update to lucene 9.12
    - Ensure performance to normalized benchmarks

Version 1.3.0
    - Update to latest searchHub API (2.3.1)

Version 1.2.0
    - Update to smartsuggest-lib 0.21.0
    - Fixing destroyed suggester leaves dangling meters
    - Add config option for non-parallel indexation (suggest.concurrent-indexation=false)

Version 1.1.1
    - Fix dependency version conflict of searchHub API with smartQuery

Version 1.1.0
    - Update to smartsuggest-lib 0.19.0

Version 1.0.3
    - Remove unused thomasmueller:minperf dependency

Version 1.0.2
    - Fix max-sharpened-queries-config

Version 1.0.1
    - Add possibility to monitor JVM details enabled by :code:`SUGGEST_SERVICE_METRICS_JVM_*` env vars

Version 1.0.0
    - Update OCS smartQuery Library 0.16 -> 0.18
    - Service: Add /health and /up endpoint
    - Service: Fix suggesterCache cleanup idle indexes
    - Service: Unify configuration loading with OCS version using suggest.properties

Version 0.16.0
    - Add AI-Suggestions (docs)
    - Service: Update base image to java 17
    - Service: Use OCS config and merge with legacy configuration
    - Implement latest ocs-suggest-spi with default config
    - SDP: add data field to S3-provided csv

Version 0.15.0
    - Add support for relaxed & sharpened queries
    - Update feign api client to 12.1

Version 0.14.0
    - Update to Java 11
    - Fix missing label for some suggestions
    - Fix corrupt payload hashmaps because of current modification
    - Extend suggest deserialize error-log

Version 0.13.6
    - Security Update of jackson library

Version 0.13.5
    - Fix startup log message

Version 0.13.4
    - Fix optional S3SuggestDataProvider not failing in case of missing s3 connection

Version 0.13.3
    - Security Update of jackson library
    - Fix missing data, if no SDP is temporary not available
    - Consider 5xx errors as temporary error

Version 0.13.2
    - Change default lookup URL of S3SuggestDataProvider

Version 0.13.1
    - Extend format for S3SuggestDataProvider
    - Ensure even distributed weight for data from S3SuggestDataProvider

Version 0.13.0
    - Introduce S3SuggestDataProvider

Version 0.12.1
    - Security Update of jackson library to mitigate  [CVE-2020-36518]

Version 0.12.0
    - Update to lucene 8.11.1
    - micrometer dependency not optional anymore



