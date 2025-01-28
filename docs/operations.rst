Operations
==========

Both modules are built in accordance with the `12-Factor App <https://12factor.net/>`_ methodology. The following points provide insights into how the modules are designed, developed, and encapsulated as RESTful/HTTP services (referred to simply as "services" in this section):

#. **Codebase and Compatibility**: Both module services are built from a single codebase and ensure full API backward compatibility.
#. **Dependency Management**: The modules share the same dependency management definition to prevent conflicts when embedded in larger Java applications. Dependencies are declared in the referenced parent Maven POM file, namely "searchhub-module-dependencies".
#. **Configuration** can be managed via volume mounts (e.g., Kubernetes config maps), system properties (startup parameters), or environment variables. (*Using a combination of these is possible but may lead to confusion.*)
#. **Backing Services**: Each module retrieves the required data from the central searchHub API and loads it into the application (whether embedded or containerized). The retrieved data is memory-efficient and disposable after use. Consequently, the modules do not require access to a database, persistent volumes, or other external storage.
#. **Build, release, run**: Both modules are delivered through automated CI/CD pipelines. They are rigorously tested for functionality and monitored with performance benchmarks.
#. **Processes**: Services are provided as containerized applications running a single Java process (PID 1).
#. **Port binding**: By default, the service runs on port **8081**, but this can be changed using the system property ``-Dserver.port=8082`` or the environment variable ``SERVER_PORT=8082``.
#. **Concurrency**: The services are synchronized with the central searchHub API and can scale horizontally as needed. Once running, the services operate independently of the API, ensuring no impact on functionality if the API connection is lost. However, maintaining the connection is recommended to receive data updates. More details are covered in the "Central API Connection" section.
#. **Disposability**: Yes, as described in 4. and 8.
#. **Dev/prod parity**: The services only use data gathered from the production system. Even in TEST or QA environments, the modules rely on productive searchHub data.
#. **Logs**: Application logs are logged in a standard format to stdout. Additionally, the smartQuery module collects event-based usage statistics and periodically send them to the central searchHub API in bulk. This is an asynchronous process using a limited buffer to avoid extensive memory consumption. If the connection to the central API is unavailable, usage statistics are dropped until the connection is restored.
#. **Admin processes**: The services expose usage metrics and other insights in Prometheus-compatible format at the ``/metrics`` and ``/prometheus`` endpoints. Both endpoints can be secured with basic authentication. The container image is based on a minimal Alpine Linux base, allowing shell access when necessary.


Embedded integration
--------------------

The modules are natively built as Java libraries and can be embedded into your application directly. They are provisioned over our Maven repository at `https://nexus.commerce-experts.com/`, so to fetch them, you need to specify it in your according pom.xml or settings.xml:

.. code-block:: xml

    <repository>
        <id>external-releases</id>
        <url>https://nexus.commerce-experts.com/content/repositories/searchhub-external/</url>
    </repository>

Metrics Adapter
~~~~~~~~~~~~~~~

Both libraries are capable of exposing metrics via a `Micrometer <https://micrometer.io/>`_ `MeterRegistry <https://docs.micrometer.io/micrometer/reference/concepts/registry.html>`_.
Since that micrometer dependency is optional and we don't want to cause class-loading errors, the according MeterRegistry has to be passed with a "MeterRegistryAdapter" when available. That's as simple as :code:`MeterRegistryAdapter.of(meterRegistry)`.

The exposed metrics are described in the according module documentation.


Central API Connection
----------------------

Both modules pull their required data from ``https://query.searchhub.com`` using the required ``SH_API_KEY``. Per default that happens with the first access to the according resource, but asynchronously. For example if ``/smartquery/v2/$name/$channel?userQuery=xy`` is requested, then the service will immediately respond with the "empty default" result, but internally it will start pulling data for the tenant "$name.$channel". As soon as the data is loaded, the very same request might respond with more meaningful data (if available for that userQuery).

To avoid empty default responses at the beginning, a list of tenants can be defined (env-var ``SH_INIT_TENANTS`` or at the library directly during initialization). In that case, the according module will load the data for those tenants *synchronously*. For the service this means increased startup time, as the service will only be ready afterwards. But this will also improve availability, as the services can immediately respond with valid data.

Special characteristic of smartQuery
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The smartQuery module will also collect event based usage stats and sends them to the central searchHub API ``https://import.searchhub.com`` in regular bulk requests. This is an asynchronous process using a limited buffer to avoid extensive memory consumption. If the connection to the central API is lost, usage stats are simply dropped until the central API is available again.

In case messages are dropped, there will be log messages warning about it, for example "searchhub stats transmitting failed {} times for tenant {}". That can happen in case of unavailability of the central API, but it can also happen, if the service gets more traffic than it can handle. Please contact us in case you have those kind of problems, as it might also be a symptom of a wrong integration.

Special characteristic of Suggest
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The suggest module is based on `Apache Lucene Core <https://lucene.apache.org/core/>`_ used as an embedded library. As the created indexes need to be stored on disk, a temporary directory is necessary. Per default the OS default temporary directory is used, which is ``/tmp`` inside the service container.
It is possible to change that directory directly in the library API ``.indexFolder(..)`` or for the service using the system property ``-Dsuggest.index-folder=/your/tmp`` or env-var ``SUGGEST_INDEX_FOLDER``.


REST Service operation
----------------------

Both modules come integrated as separate HTTP service containers, but also as a combined service capable of handling requests to both modules: ``commerceexperts/searchhub-integration-service:latest``. That kind of service is especially important for the ``/smartsuggest/v4`` endpoint, as that endpoint uses the smartQuery module to enrich the suggest response with mapping information.

That combined service will load the modules with the first request to the according endpoints. To improve availability, the modules can be initialized during startup with the properties ``-Dsmartquery.initOnStartup=true`` and ``-Dsuggest.initOnStartup=true``.


Service Topology
~~~~~~~~~~~~~~~~

As the suggest module is required for requests from the frontend directly, it should be available without authentication restriction. However we recommend to use a load balancer or reverse proxy to distribute the incoming suggest-requests only to the required suggest endpoints. This way the other unused endpoints are not exposed.

The smartQuery module should be placed as close to the search-engine as possible, as it needs to be requested right before the search-engine.
However due the capability of reducing the amount of unique queries (different but similar user queries are mapped to the very same user query), it might be a good idea to place this before the search-engine cache (if available) to increase cache-hit-ratio.
Another exceptional scenario is a search-engine integrated into frontend, so that its requested directly from the browser. In that case we recommend to use the ``/smartsuggest/v4`` endpoint, that delivers both service responses with a single request.

.. image:: img/service-topology.png
  :width: 690
  :alt: Service Topology


Additional Endpoints
~~~~~~~~~~~~~~~~~~~~

:code:`/up` is a simple static endpoint, that will respond with http code 200 as soon as the container is started

:code:`/health` gives more details about the loaded modules and which tenants are loaded respectively. For example:

.. code-block:: json
    {
        "smartquery": {"tenant.one": "Ready", "tenant.two": "Noop"},
        "suggest": {"tenant.one": "Ready", "tenant.two": "NotReady"}
    }


:code:`/prometheus` and :code:`/metrics` provide access to insight metrics. The module specific metrics are described in the according module section.
Additional the following service metrics are exposed:

- ``http_server_requests_count``: Total number of all requests measured
- ``http_server_requests_error_count``: total number of requests that were responded with http code >= 400
- ``http_server_requests_seconds``: total request time of all requests measured. Can be used to calculate rate and total average.
- ``http_server_requests_seconds_min``: fastest request measured so far
- ``http_server_requests_seconds_max``: slowest request measured so far

These metrics are labeled with the label "endpoint" having the value "smartsuggest" or "smartquery".

