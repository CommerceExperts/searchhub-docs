Service Operations
==================

.. note::

    This section focuses on suggest-specific settings. Additional configuration options are described in the `common operations`_ section.

Technical base knowledge
------------------------

The smartSuggest library is built on top of `Lucene`_, and therefore benefits from appropriate hardware (ideally: local ssd). For general performance tuning, refer to established best practices such as those described in "Lucene in Action (2nd Edition)". Since the Lucene indexes are prebuilt and used in read-only mode, indexing performance is not a concern.

In addition, all supplementary payload data is stored in a key-value store based on `RocksDB`_ which utilizes memory-mapped files. For optimal performance, ensure that sufficient memory is available outside the Java heap space to support the OS file cache.


Configuration
-------------

Configuration can be provided via a properties file mounted at ``/app/config/suggest.properties`` inside the container.

.. code-block:: bash

    docker run [...] -v "$(pwd)/suggest.properties":/app/config/suggest.properties [...]

Settings can also be provided via system properties or environment variables, which override values defined in ``suggest.properties``. To define system properties, use the ``JAVA_TOOL_OPTIONS`` environment variable and prefix each property with ``-D``. For example:

.. code-block:: bash

  docker run [...] -e JAVA_TOOL_OPTIONS="-Dsearchhub.apikey='your-api-key' -Dsuggest.service.max-idle-minutes=90" [...]

Each configuration property has a corresponding environment variable. Environment variables are only applied if no corresponding system property is defined.

To prevent ambiguity, it is recommended to use only one method for defining configuration values.

suggest.service.max-idle-minutes
    | (*SUGGEST_SERVICE_MAX_IDLE_MINUTES*)
    | If a suggest index is not accessed for the specified duration, it will be unloaded.  
  A subsequent request will return an empty result and trigger reloading of the index.
    | Setting this value to ``0`` or a negative number disables automatic unloading entirely.
    | Default value is ``30``

suggest.update-rate
    | (*SUGGEST_UPDATE_RATE*)
    | Defines, in seconds, how frequently the service checks for updated data for each loaded index.
    | Default value is ``60``

suggest.preload-indexes
    | (*SUGGEST_PRELOAD_INDEXES*, *SH_INIT_TENANTS*)
    | A comma-separated list of indexes (searchHub tenants) to preload during service startup.

suggest.concurrent-indexation
    | (*SUGGEST_CONCURRENT_INDEXATION*)
    | Boolean value (default: ``true``). If set to ``false``, indexation is performed sequentially instead of concurrently.
    | This reduces CPU usage but increases the time required until the service is fully ready.

searchhub.apikey
    | (*SH_API_KEY*)
    | The API key required to load suggestions from searchHub.  
  This setting should preferably be provided via an **environment variable**.

API KEY
^^^^^^^

An API key is required to start the service and must be obtained from your searchHub contact.
In environments with secret management capabilities, the API key should be injected via an environment variable.

.. code-block:: bash

  SH_API_KEY="your-secret-api-key"


Deprecated Settings
^^^^^^^^^^^^^^^^^^^

suggest.server.port
    | Will only be used, if the renamed property 'server.port' can't be found.

suggest.server.address
    | Will only be used, if the renamed property 'server.address' can't be found.



Monitoring
----------

The service exposes several metrics in **Prometheus format** via the :code:`/prometheus` endpoint.

.. glossary::

    smartsuggest.update.success.count.total
        Total number of successful data updates per tenant.
        This metric is labeled with `tenant_name` and `tenant_channel`.

    smartsuggest.update.fail.count
        Number of consecutive failed update attempts for a tenant. The counter is reset to ``0`` after a successful update.
        If this value reaches ``5``, the update process is stopped and will only resume once suggestions for the corresponding tenant are requested again. This metric is labeled with ``tenant_name`` and ``tenant_channel``.

    smartsuggest.suggestions.size
        Current number of raw suggestion records per tenant.
        This metric is labeled with `tenant_name` and `tenant_channel`.

    smartsuggest.suggestions.age.seconds
        Time in seconds since the last successful update. 
        This metric is labeled with `tenant_name` and `tenant_channel`.






.. _common operations: ../operations.html
.. _Lucene: https://lucene.apache.org/
.. _RocksDB: https://rocksdb.org/
