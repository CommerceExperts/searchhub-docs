User Stories
============

In order to aid Product Owners in developing according to agile principles, we have expressed our recommended best practices as user stories. Feel free to copy and paste this to your backlog.

smartSuggest Implementation
---------------------------

Story
  As a customer, I want to see query autocompletions and product suggestions in the search bar that are optimized using CXP searchHub's smartQuery, so that I can precisely formulate my intent and quickly discover relevant searches and products.

Acceptance criteria
  - **Contextual Pre-Suggestions:** When a user focuses or clicks into the search input field, pre-suggestions should be displayed.
  - If a known context URL is provided, the pre-suggestions should be strongly related to that context (e.g., category page, campaign page, or product page). If no known context is available, the displayed pre-suggestions should fall back to those configured by the Default Pre-Suggest Type.

  - **Query Suggestions:** While the user types into the search field, query suggestions should be retrieved for each typed input from the searchHub `smartSuggest module`_.
  - When a user selects one of the suggested queries, a search request should be submitted using, where `smartQuery`_ mapping is applied on the selected suggestion. smartQuery mapping might result in a different than the displayed query or in a redirect to a pre-defined URL

  - **Product Suggestions:** While the user types into the search field or hovers over query suggestions, relevant product suggestions should be displayed. These product suggestions should be semantically related to the current query or suggestion. When a user clicks on a product suggestion, the user should be redirected directly to the corresponding Product Detail Page (PDP)

  - internal systems can access https://query.searchhub.io/ to fetch the necessary data
  - internal systems can access https://import.searchhub.io/ to send usage information that are used to monitor and optimize the results

.. _smartQuery: https://docs.searchhub.io/module_smartquery.html
.. _smartSuggest module: https://docs.searchhub.io/module_smartsuggest.html
