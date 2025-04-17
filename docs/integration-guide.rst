Integration Guide
=================

Understanding searchHub
-----------------------

searchHub is an add-on that optimizes your existing site search, so you don't have to. Whether you use a proprietary search like FACT-Finder or Algolia, or an open-source solution like Elasticsearch, your shop visitors' search journeys are individually optimized based on purchase intent. This is where searchHub is different: Instead of optimizing keyword "strings",  we approach customer search journey optimization differently.  Our industry-leading keyword-tracking technology identifies the underlying "thing" or purchase intent of each customer.

All keywords that represent the same intent are grouped together and so we call them "intent clusters". These clusters are analyzed to determine the most profitable "keyword ambassador" (aka “master query”). This master query must fulfill strict selection requirements for both the shop's bottom line and end-user purchase intent. In a final step, the master query is sent to your existing search engine for further processing. This is the underlying core of searchHub.

The searchHub management UI facilitates the analysis and access to industry-leading search engine performance data, a unified optimization tool for all search engines. It is here that intent clusters are verified, improved and corrected. By enabling search managers to enrich search data with industry and category knowledge, the searchHub management UI goes a step further. Now, adding redirects to curated landing pages is done from the same tool used to analyze keyword performance data, making search analytics data truly actionable.

Combining this data makes sure that users are supported at essential steps along their journey, ensuring they can find and buy according to their desires.

To better support an integration par excellence, into existing search ecosystems, we have extracted 3 separate components:

    - Search Collector
    - smartSuggest
    - smartQuery

Search Collector
~~~~~~~~~~~~~~~~
The Search Collector is used to collect users' inputs and track interactions with the associated results. This is the foundational data source for the building of intent clusters. What's more, the same data is also used to provide industry-leading insights for the operation and maintenance of the search.

smartSuggest
~~~~~~~~~~~~
The smartSuggest module uses the clustered query variations and their related KPIs to provide relevant, performance-driven and versatile as-you-type suggestions (also known as auto-completions). With Search Collector delivering robust query variation data, we can deliver unique, high-value, typo-free, and duplicate-free suggestions.

smartQuery
~~~~~~~~~~
The smartQuery module provides search instructions to the associated search engine. This begins with a straight-forward query mapping that simply replaces the user query with a so-called master query. This "keyword ambassador query" represents an entire query intent cluster. It’s the query that has historically performed the best within the framework of the associated search engine.

Search instructions go beyond simple query replacement. Currently, this module supports the following search engine instructions:

    - Redirect URLs that lead users to curated or targeted landing pages
    - In the case of ambiguous input, we provide potential search term corrections for the end user.
    - Related queries that might lead the user to more precise and therefore better results.
    - Result Modification that improves the result set itself.

Getting started
---------------

This is a basic overview of the steps toward a full searchHub integration. Our engineers assist you throughout to ensure the best possible solution for your scenario.

1. POC
~~~~~~
For an initial POC setup, we require some kind of query-based data, exported from your analytics system. Such data is generally of poor quality and no longer useful beyond the POC phase. To ensure production-ready search data collection, we highly recommend implementing our well-documented and easy-to-integrate Search Collector.

2. Search Collector Tracking
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Search Collector is a searchHub script installed directly into your shop front-end. It's specific to your shop structure, making integration easy. To ensure the highest level of reliability, we recommend adding tracking attributes to the shop HTML. Further details can be found in the accompanying `Integration Docs <search-collector.html>`_.

Additionally, we provide sample texts for your cookie consent management system and your privacy policy. Be sure to include the necessary internal business contacts to guarantee corporate compliance.

3. searchHub on-boarding
~~~~~~~~~~~~~~~~~~~~~~~~
Upon receiving an initial search data export or once the Search Collector has been integrated, we allocate a single or multichannel tenant within searchHub. A channel defines distinct operational units within a tenant. Each language is a unique channel. However, there are scenarios in which a single language may necessitate several channels. For example, within tenants of a single language but with differing shop data.

Once completing setup, you will receive a list of your allocated channels, and your API Key.

4. Choose Integration Type
~~~~~~~~~~~~~~~~~~~~~~~~~~
smartQuery and smartSuggest integration modules, are delivered as Java Libraries. If you’re running on Java, it is recommended to integrate these directly into your search infrastructure. All integration details can be found in the respective module documentation.

HTTP/REST headless services are provided for all other platforms, or in instances where external proprietary code is not allowed. Delivered as public Docker images, they can be operated on premise or from searchHub (as a service). If possible, we recommend to run the service on premise to reduce latency. The simple JSON API can be easily adopted either with a generated OpenAPI Client, a self-made HTTP-Client, or one of our available home-grown clients.

In the event on-premise services are chosen, please inform the responsible IT department as soon as possible. Provide them with the appropriate implementation guides for `smartSuggest <module_smartsuggest.html>`_ and `smartQuery <module_smartquery.html>`_.

5. Define User Stories
~~~~~~~~~~~~~~~~~~~~~~
It is our aim to support you throughout the searchHub integration process. To this end, we provide you with ready-to-use user story templates, in which we describe the crucial integration tasks for each module. Download them here and add your own relevant integration details now.

Find the user stories for `smartSuggest <smartsuggest/user-stories.html>`_ and `smartQuery <smartquery/user-stories.html>`_ here.

6. Quality Assurance
~~~~~~~~~~~~~~~~~~~~
Once searchHub is pushed to the "testing stage"  we happily verify everything works as expected, at no extra charge. Please don't hesitate to involve us in your deployment process.


