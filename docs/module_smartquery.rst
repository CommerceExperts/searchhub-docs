Module: smartQuery
==================

The smartQuery module provides search instructions to the associated search engine. This begins with a straight-forward query mapping that simply replaces the user query with a so-called master query. This "keyword ambassador query" represents an entire query intent cluster. It’s the query that has historically performed the best within the framework of the associated search engine.

Search instructions go beyond simple query replacement. Currently, this module supports the following search engine instructions:

    - Redirect URLs that lead users to curated or targeted landing pages
    - In the case of ambiguous input, we provide potential search term corrections for the end user.
    - Related queries that might lead the user to more precise and therefore better results.
    - Result Modification that improves the result set itself.

Please make sure to know about the basic terminology defined in the `glossary`_ before going on with this section.
Then we recommend to understand the predefined `user stories`_ describing the high level goals of an integration and finally head to `setup and implementation`_ with all the details.
Operators of the HTTP service variant should have a close look at the common `operations`_ section that covers all around system behaviour and instrumentation.
To stay updated about recent changes, have a look at the `changelog`_.


.. toctree::
   :maxdepth: 3
   :hidden:

   smartquery/user-stories
   smartquery/setup
   smartquery/integration
   smartquery/changelog

.. _glossary: glossary.html
.. _user stories: smartquery/user-stories.html
.. _setup and implementation: smartquery/setup.html
.. _operations: operations.html
.. _changelog: smartquery/changelog.html
