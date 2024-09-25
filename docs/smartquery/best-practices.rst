Best Practices
==============

To aid Product Owners in developing according to agile principles, we have expressed our recommended best practices as user stories. You are welcome to copy and paste this into your backlog.

Basic smartQuery Implementation
-------------------------------

Story
  As a customer, I want to see search results that are optimized using CXP searchHub (https://docs.searchhub.io/) and which are frequently updated using recent KPI data.

Acceptance criteria
  - Search phrases are checked/optimized using searchHub's smartQuery Module (https://docs.searchhub.io/module_smartquery.html) before being submitted to the internal search engine
  - internal systems can access https://query.searchhub.io/ to perform the search phrase check
  - internal systems can access https://import.searchhub.io/ to send and receive data updates


Extended smartQuery Implementation (Recommended)
----------------------------------

Story
  As a search-manager, I want to leverage the full potential of searchHub query testing, so that I can compare the performance of different results for the same search intent.

Acceptance criteria
  - Everything from the *Basic smartQuery Implementation*
  - The value of the cookie :code:`SearchCollectorSession` is passed to smartQuery
  - For search queries being tested, I want to see varying search results across different sessions.

Technical hint
  - smartQuery::getMapping has a parameter 'sessionId' that has to be set for the extended implementation to work.
    When provided, it allows certain queries to return different mapped queries based on the sessionId. This behavior occurs only for queries within a test cluster, where two queries are part of the same query-testing experiment. These experiments can be viewed in the searchHub UI under "Query Testing."


Query Correction Feedback
-------------------------

Story
  As a customer, I want to see the corrected query but also have the option to search using my original input (instead-search-for).


Acceptance criteria
  - If query mapping occurs, a message should be displayed indicating the corrected query.
  - Additionally, there should be a link allowing the user to search for their original query.
  - When the link is clicked, the original query should be used without any mapping.

Technical hint
  - You can utilize the `bypass`_ feature of smartQuery by wrapping the query in quotes. This prevents mapping, and, upon submission, the quotes will be removed.
  - If a `direct integration`_ is implemented, the utility function `io.searchhub.smartquery.util.QueryAssessment.isOnlyWordReorder` can be used to prevent query correction feedback when the original and corrected queries contain the same words in a different order.


Potential correction alternatives
---------------------------------

Story
  As a user, I want to see alternative versions of my misspelled query if it cannot be confidently corrected automatically through direct mapping.

Acceptance Criteria
  - If no automatic correction is applied, display a suggestion for alternative corrections (e.g., "Did you mean...").
  - The suggested queries should be clickable, allowing them to replace the current query when selected.

Technical Guidance
  If no reliable masterQuery could be found, the mapping includes a 'potentialCorrections' property, which is an array containing one or two query suggestions.


searchHub Redirects
-------------------

Story
  As a search manager, I want users to be redirected to specific landing pages for certain queries based on the configurations set within searchHub.

Acceptance criteria
  - When a query is configured for a redirect, users should be directed to the corresponding landing page or URL.


.. _bypass: common.html
.. _direct integration: direct-integration.html
