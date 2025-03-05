Glossary
========

Tenant
------

The tenant value is used as an ID and references a single data domain, e.g. a customer domain. Normally we define the tenant names and let you know about it after the setup.

The tenant is composed of two values in the format `<name>.<channel>` or sometimes as part of a path in the format `/<name>/<channel>/`.

  1) "name": That's the base "name", which normally would be the customer name and should be static for the complete integration.

  2) a "channel", which provides a second level of segmentation. Naming wise it can represent a language (en, de, ..), for example, or a sales channel (mobile, www, ..).
     The naming is part of the setup and in doubt is normally discussed in one of the first kick-off meetings.

In most cases, the tenant is dictated by the provided data. In practice we inform you about the available tenants, as these are used elsewhere in the overarching data processing pipeline, as unique identifiers.


Query Naming
------------

When talking about a "query", we distinguish between the following types of queries:

  - As soon as a user starts typing, the first letters may be sent to the suggest/auto-complete service. That 'prefix query' is considered incomplete and can be handled smartSuggest rather then smartQuery.
  - The final query inserted into the search box (coming by the suggest-service or completed by the user itself) is what we call the "user query". That query should be passed to smartQuery.
  - The search phrase, which smartQuery maps to, is called "search query" because that's the actual text that the search engine has to process.
  - Finally, we have the "technical query". This is the structured query that is sent to the search engine, e.g. a SQL Query or a Elasticsearch query.

Query Mapping
-------------

A mapping takes place, if a user query is changed into a search query or another instruction for the search-engine.

In the event the user query is able to be mapped, a different search query will return. The replacement of a user-query with a potentially other query is what we call a query mapping.

If the user query itself is already known as the best query, we map it back to that identical query. This is tracked as a successful mapping nevertheless.

If the user query can't be mapped then itself should be sent to the search engine. The integration methods and endpoints return rich objects that contain all the required information.

Bypassing Query
---------------

If the inserted query is wrapped in double quotes (``"example query"``) the query will be handled as an unknown query and will not be mapped, however smartQuery will strip the quotes so the unquoted query can be processed by the following search phrases.

This can be used to implement the `query correction feedback`_ feature that gives the customer the option to search for this initial input, e.g. ``Results are shown for <mapped query> - search instead for "<original query>"``.
Just make sure to pass the double quotes into smartQuery as well, it will strip it for you.


.. _query correction feedback: smartquery/user-stories.html#query-correction-feedback
