Service Operations
==================

.. note::

    This part covers the specifics to suggest. Please check the general `operations`_ section for more configuration options.


Configuration
-------------

To set those configuration values, you can inject a properties file into the container, bind it into the container at path ``/app/config/suggest.properties``.

.. code-block:: bash

    docker run [...] -v "$(pwd)/suggest.properties":/app/config/suggest.properties [...]

Each setting can also be set as system property or environment variable, those take precedence over what's set in the ``suggest.properties`` file. To inject those properties as system-properties, use the JAVA_OPTS environment variable and specify each property prefixed with `-D`, for example

.. code-block:: bash

  docker run [...] -e JAVA_OPTS="-Dsearchhub.apikey='your-api-key' -Dsuggest.service.max-idle-minutes=90" [...]

For all those properties there are also according environments variables that could be set. Those are only used if there is no according "property value" found. Please stick to one way of defining properties to avoid confusion.

suggest.service.max-idle-minutes
    | (*SUGGEST_SERVICE_MAX_IDLE_MINUTES*)
    | If a suggest index is not requested for that time, it will be unloaded. A new request to that index will return an empty list, but restart the loading of that index.
    | A value of '0' or smaller will disable the unloading mechanic completely and never free up used space by created suggest indexes.
    | Defaults to 30

suggest.update-rate
    | (*SUGGEST_UPDATE_RATE*)
    | Defines in seconds, how often the suggest library checks for new data for every loaded index.
    | Defaults to 60

suggest.preload-indexes
    | (*SUGGEST_PRELOAD_INDEXES*, *SH_INIT_TENANTS*)
    | Comma-separated list of indexes (=searchHub tenants) that should be initialized at the start of the service.

suggest.concurrent-indexation
    | (*SUGGEST_CONCURRENT_INDEXATION*)
    | boolean value, 'true' per default. Can be set to 'false' so that the indexation of the received data will be done sequentially.
    | This means it will take longer until the service is ready for usage and will spare computational power that might be used for others.

searchhub.apikey
    | (*SH_API_KEY*)
    | Required API Key to load suggestions from searchHub. That's the only setting that should rather be set as a environment variable.

API KEY
^^^^^^^

The API Key is required to start the service. You will get the searchHub API Key from your contact person.
In a environment that can manage secrets, it is recommended to inject the API Key via Environment variable .

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

There are several metrics that are exposed in the prometheus format through the :code:`/prometheus` endpoint of the service.

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






.. _operations: ../operations.html
