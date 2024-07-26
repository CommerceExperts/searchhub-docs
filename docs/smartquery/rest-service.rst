REST Service Integration
========================

In case you are unable to use the Java library directly (most likely due to your system not running on the JVM), you can use the REST-service wrapper for smartQuery. It's delivered as a docker image and must run in your environment.

Requirements
------------

- a minimum of 250MB + more space depending on the amount of data to manage
- the service needs access to the following HTTPS Endpoints https://query.searchhub.io/ and https://import.searchhub.io/


Start the service
-----------------

The service is provided as a docker image on `docker hub`_ with the name :code:`commerceexperts/smartquery-service:${SMARTQUERY_VERSION}`
    
The container must be initiated with your API key set to the environment variable `SH_API_KEY` (for legacy support `SQ_API_KEY` is also accepted).
The container exposes port 8081 which can be mapped to any port. Please consider, that the docker container needs access to the remote URLs mentioned above in the Requirements_ section.

  .. code-block:: bash

    # use the API key we provide
    docker run -d --name=smartquery-service -e SH_API_KEY=<YourS3cr3tAPIkey> -P commerceexperts/smartquery-service:${SMARTQUERY_VERSION}

    
Using the service
-----------------

The service offers two endpoints to get a query mapping:

Service Endpoint V1
^^^^^^^^^^^^^^^^^^^

URL Scheme:
  ``http://<host>:<port>/smartquery/v1/<tenant-name>/<tenant-channel>?userQuery=<user-query>``

Parameters:
    - tenant-name (path): the first part of the tenant provided by searchHub
    - tenant-channel (path): the second part of the tenant provided by searchHub
    - userQuery (query): the text the user entered in the search box
    - sessionId (query): optional parameter that MUST contain the value of the SearchCollectorSession (see details below)

Example:
  .. code-block:: bash

     curl localhost:10240/smartquery/v1/test/working?userQuery=bierzellt -o -
     # returns 'bierzelt' on success
     # returns 'bierzellt' if no mapping was found or no data is available

The response is a simple string which is either the mapped query, or in the event no mapping is found, the original user query. Redirects are not supported for this endpoint and won't be returned, even if available.

Keep in mind, smartQuery starts fetching mapping data, after the initial request for a specific tenant is received. As a result, for the first ~5 seconds all mappings will return the input query, due to mapping data having not yet been fetched. You should begin receiving mapped queries within a few seconds - provided data is available.

Alternatively, it's possible to remove the aforementioned startup latency by specifying the desired tenants by invoking the `preloadTenants` parameter outlined below. This variation will make the service available as soon as the mappings have been loaded.


Service Endpoint V2
^^^^^^^^^^^^^^^^^^^

URL Scheme:
  ``http://<host>:<port>/smartquery/v2/<tenant-name>/<tenant-channel>?userQuery=<user-query>``

Parameters:
    - tenant-name (path): the first part of the tenant provided by searchHub
    - tenant-channel (path): the second part of the tenant provided by searchHub
    - userQuery (query): the text the user entered in the search box
    - sessionId (query): optional parameter that MUST contain the value of the SearchCollectorSession (see details below)

Example:
  .. code-block:: bash

     curl localhost:10240/smartquery/v2/test/working?userQuery=jakce -o -
     # returns: 
     {
       "userQuery":"jakce",
       "masterQuery":"jacke",
       "searchQuery":"jacke",
       "redirect":null,
       "successful":true,
       "potentialCorrections": null
     }

The response is an object that contains the following properties:

  - **userQuery**: the entered user query
  - **masterQuery**: if the query could be mapped, the master query is set, otherwise it's null.
  - **searchQuery**: the final search query. This is the master or the user query.
  - **redirect**: URL to a landing page or null if no redirect is configured.
  - **successful**: `true` if the query could be handled by smartQuery
  - **potentialCorrections**: an optional array of 1 or more queries that could be a correction to the given query. This is only given if no reliable masterQuery could be found.

Integration with sessionID
^^^^^^^^^^^^^^^^^^^^^^^^^^

If the `search collector`_ is integrated into the frontend of your system, it is recommended to pass the corresponding sessionId to smartQuery.
This sessionId is used for clusters with queries under test to distribute the search traffic evenly between both queries.
Without the sessionId, the informative value and success rate of these tests are lower.

For implementation, the value of the :code:`SearchCollectorSession` cookie *MUST* be used and passed with the 'sessionId' parameter. Using a different will lead to unexpected results.
If the :code:`SearchCollectorSession` cookie does not exist or is not provided for a request, don't set the 'sessionId' parameter at all.

Configuration
-------------

Update Rate
^^^^^^^^^^^

Sets the rate (in seconds) at which the update should run. The value must be between 5 and 3600.
This can be set as part of the JAVA_OPTS environment variable:

.. code-block:: bash

    JAVA_OPTS="-Dsmartquery.updateRateInSeconds=60"

    
Preload Tenants
^^^^^^^^^^^^^^^

Specify tenants that should be loaded immediately following initialization.
Can be set either as a comma-separated list, via the environment variable:

.. code-block:: bash

    SH_INIT_TENANTS="example.num1,example.num2"

(for legacy support `SQ_INIT_TENANTS` is also accepted)
or as part of the JAVA_OPTS environment variable with one parameter per tenant:

.. code-block:: bash

    JAVA_OPTS="-Dsmartquery.preloadTenants[0]=example.num1 -Dsmartquery.preloadTenants[1]=example.num2"


Basic Authentication
^^^^^^^^^^^^^^^^^^^^

In case you want to enable basic authentication, add the following properties to the `JAVA_OPTS` environment variable.

.. code-block:: bash

    JAVA_OPTS="-Dserver.auth.enabled=true -Dspring.security.user.password=<desired-password>"

The user that is linked to that password is `user`. To use a different username, add the property `-Dspring.security.user.name=<your-username>` to `JAVA_OPTS`.

If server authentication is enabled but the password property is omitted, a random password will be generated and printed to the logs / standard out.

.. note::
    Due to an update of Spring Boot to Version 2 with smartquery 1.2.10, the security properties changed.
    For smartquery service version <= 1.2.9 the properties are without the 'spring.':

    `JAVA_OPTS="-Dserver.auth.enabled=true -Dsecurity.user.password=<desired-password> -Dsecurity.user.name=<your-username>"`

Port and other 
^^^^^^^^^^^^^^

Since the service is built with Spring Boot 2, please have a look at the according `Spring Boot 2 web server configuration`_.

For a quick reference here are a few options that might be interesting for your operational goal:

- Use `server.port=8080` to change to desired web application port (defaults to 8081)
- Use `management.server.port=8081` to change to another port than the main port which is default.
- Use `server.compression.enabled=false` to disable compression, which is enabled by default.

Internally the Jetty Server is used, so to enable access logging for example, use the according jetty properties:

- `server.jetty.accesslog.enabled=true` (Without a specified file, these logs are routed to `System.Err`)
- `server.jetty.accesslog.filename=/var/log/jetty-access.log` (Make sure to get those files out of the running container to avoid disk pressure problems)

Set all those properties via the `JAVA_OPTS` environment variable prefixed with `-D`.


Monitoring
----------

A health status can be retrieved at the endpoint :code:`/health`.

Application metrics are exposed at the management port in the prometheus format through the :code:`/prometheus` endpoint of the service. In addition to the metrics described in the `monitoring`_ section of the `direct integration`_ docs, this endpoint also exposes several HTTP and Java metrics.

Due to backwards compatibility these endpoints are exposed at the same port as the service itself. It is recommended to change this with the startup property `JAVA_OPTS="-Dmanagement.server.port=8082` setting it to your desired port.

To **disable** this endpoint completely use the startup property `JAVA_OPTS="-Dmanagement.endpoint.prometheus.enable=false"`

For more options see the `Spring Boot 2 Monitoring Reference`_.


Troubleshooting
----------------

  - The container won't start, if you forget to specify the API key.
  - Should you attempt to access an non-permitted tenant/channel (due to an incorrect API key, for example), you will see an error message similar to: `update failed: FeignException: status 403 reading QueryApiTarget#getModificationTime(Tenant); content: {"message":"Invalid authentication credentials"}`
  - Enable debug logging, in order to obtain more information concerning internal activities. Activate this using the following docker startup parameter `-e JAVA_OPTS="-Dlogging.level.io.searchhub=DEBUG"`


.. _direct integration: direct-integration.html
.. _monitoring: direct-integration.html#monitoring
.. _docker hub: https://hub.docker.com/r/commerceexperts/smartquery-service/tags
.. _Spring Boot 2 Monitoring Reference: https://docs.spring.io/spring-boot/docs/2.1.17.RELEASE/reference/html/production-ready-monitoring.html
.. _Spring Boot 2 web server configuration: https://docs.spring.io/spring-boot/docs/2.1.17.RELEASE/reference/html/howto-embedded-web-servers.html#howto-change-the-http-port
.. _search collector: search-collector.html
