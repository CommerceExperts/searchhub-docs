Module: smartSuggest
====================

smartSuggest leverages enriched and clustered data from searchHub to deliver a sophisticated, state-of-the-art suggestion system for eCommerce and retail applications.

Under the hood, smartSuggest is built on the widely adopted and battle-tested Apache Lucene open-source library. The engine is heavily optimized for the specific requirements of modern eCommerce search, enabling scalable, fast, and highly relevant suggestions tailored to domain-specific use cases.

The module automatically connects to the searchHub API to retrieve the necessary data, pre-build the required indices, and send back important statistical logs related to module performance and usage.


smartSuggest supports several suggestion types, depending on the specific use case.

1. Intent-Aware Query Suggestions
---------------------------------
smartSuggest transforms traditional search suggestions into true intent predictions.

Using the same clustering technology as smartQuery, smartSuggest identifies the most likely user buying intents, enriches them with contextual information, and guides users through the product catalog. This significantly reduces the number of low-performing or ambiguous searches.

2. Intent-Aware Product Suggestions
-----------------------------------
Traditional keyword based product suggestions ignore evolving intent and fail on ambiguous queries. smartSuggest combines intent similarity with behavioral signals, continuously improving product suggestion relevance.

3. Scoped Suggestions
---------------------
For broad intent, smartSuggest recommends relevant or contextual scopes before search execution preventing unfocused result pages and bounce.

4. Contextual Pre-Suggestions
-----------------------------
Intent often starts before typing. smartSuggest delivers pre-suggestions based on the current or last recent user context (e.g., category page, campaign entry, viewed product), with safe fallbacks to the in our UI configured (Default Pre-Suggest Type) when context is limited or unknown.


We recommend following the `user stories`_ to get started with the smartSuggest integration into your system.


.. _user stories: smartsuggest/user-stories.html
.. _Open Commerce Search Stack: https://github.com/CommerceExperts/open-commerce-search


.. toctree::
   :maxdepth: 2
   :hidden:

   smartsuggest/user-stories
   smartsuggest/setup
   smartsuggest/service-integration
   smartsuggest/service-operations
   smartsuggest/java-integration
   smartsuggest/changelog
   
