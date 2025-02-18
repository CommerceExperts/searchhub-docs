Operations
==========

.. note::

    This part covers the specifics to smartQuery additional to what's described in the `setup`_ and `integration`_ section.
    Please check the `general operations`_ section for the service configuration options.


Configuration
-------------

At the Java integration you can directly set those values. For the HTTP Service all is done via System properties. Those are passed into the container using the ``JAVA_OPTS`` environment variable.

Update Rate
~~~~~~~~~~~

Sets the rate (in seconds) at which the update should run. The value must be between 5 and 3600.

.. tabs::

    .. tab:: HTTP Service

      .. code-block:: bash

        JAVA_OPTS="-Dsmartquery.updateRateInSeconds=60"

    .. tab:: Java Integration

      .. code-block:: java

        QueryMapperManagerBuilder qmmBuilder = QueryMapperManager.builder();
        qmmBuilder.updateRate(3600);


Preload Tenants
~~~~~~~~~~~~~~~

Specify tenants that should be loaded immediately following initialization. The service will only be ready (listening on the given port) after those tenants are loaded.

.. tabs::

    .. tab:: HTTP Service

      There are two ways to set the preload tenants. Either set the ``SH_INIT_TENANTS`` environment variable directly
      or if you're already using the ``JAVA_OPTS`` environment variable, you can add it as a part of it:

      .. code-block:: bash

        SH_INIT_TENANTS="example.num1,example.num2"
        # alternative:
        JAVA_OPTS="-Dsmartquery.preloadTenants=example.num1,example.num2"

    .. tab:: Java Integration

      .. code-block:: java

        QueryMapperManagerBuilder qmmBuilder = QueryMapperManager.builder();
        qmmBuilder.updateRate(3600);

Mapping Threshold
~~~~~~~~~~~~~~~~~

In case you want to guard against wrong data updates, you can define a minimum amount of data records. If the update fetches less data records, an update is denied. Please be careful with this setting, especially if you don't know how much data searchHub will provide for your tenants.

.. tabs::

    .. tab:: HTTP Service

      .. code-block:: bash

        JAVA_OPTS="-Dsmartquery.defaultMappingThreshold=100"

    .. tab:: Java Integration

      .. code-block:: java

        QueryMapperManagerBuilder qmmBuilder = QueryMapperManager.builder();
        qmmBuilder.mappingThreshold(100);


Stats Collector Filter
~~~~~~~~~~~~~~~~~~~~~~

If you notice too much traffic load sent by the internal stats-collector to ``import.searchhub.io``, you can enable the stats-collector-filter

.. tabs::

    .. tab:: HTTP Service

      .. code-block:: bash

        JAVA_OPTS="-Dsmartquery.statsCollectorFilter.enable=true"

    .. tab:: Java Integration

        .. warning::
            This is only available as a part of the HTTP Service.




Monitoring
----------

Additional to the `general monitoring`_ values exposed around the service, the smartQuery module also exposes these specific values.

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


.. _setup: setup.html
.. _integration: integration.html
.. _general operations: ../operations.html
.. _general monitoring: ../operations.html#monitoring
