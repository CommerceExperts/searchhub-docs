Module: smartSuggest
====================

smartSuggest uses the enriched and clustered searchHub data to build a sophisticated suggest functionality. 
As a base technology Apache Lucene is used to provide fast and weighted query suggestions. The implementation is part of the "`Open Commerce Search Stack`_"

The module automatically connects to the searchHub API in order to get the required data and to send back statistics and performance information about the module and its usage.

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
   
