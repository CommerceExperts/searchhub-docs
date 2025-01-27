Best Practices
==============

In order to aid Product Owners in developing according to agile principles, we have expressed our recommended best practices as user stories. Feel free to copy and paste this to your backlog.

Basic smartSuggest Implementation
---------------------------------

Story
  As a customer I want to see autocompletion / search suggestions in the searchbar that are optimized using CXP searchHub.

Acceptance criteria
  - When typing into the search box, search phrases are suggested based on every single typed user input using searchHub's smartSuggest Module (https://docs.searchhub.io/module_smartsuggest.html).
  - Selecting one of those suggested queries, causes a search request to the shop
  - (In case `SmartQuery`_ is used, these suggested terms should still be mapped by SmartQuery)
  - internal systems can access https://query.searchhub.io/ to fetch the necessary data
  - internal systems can access https://import.searchhub.io/ to send usage information that are used to monitor and optimize the results


searchHub AI-Suggestions
------------------------

Story
  As a user, I want to see auto-completion/search suggestions displayed when I click on the search box, even if I haven’t started typing anything yet.

Acceptance criteria
  - AI-Suggestions from searchHub of type "TBD" are displayed when the search box is clicked on and its value is empty
  - The AI-Suggestions displayed are the most relevant for our use case, which may be a combination of different types
  - The AI-Suggestions are a simple list of queries without any metadata, so they should be displayed in a simple list.

The 5 provided types of AI suggestions are optimized for demand, for trends, for findability, for sellability, or a combination of all (MOST_INSPIRING)

Technical hint
  To request the AI-Suggestions from smartSuggest you’ll have to provide one of the following 5 different exposed **special queries** to the API:

  - MOST_INSPIRING
  - MOST_POPULAR
  - HIGHEST_POPULARITY_UPLIFT
  - HIGHEST_FINDABILITY_UPLIFT
  - HIGHEST_SELLABILITY_UPLIFT

  Those query are set with the same parameter :code:`userQuery` that is also used for the user input. As soon as the user starts typing, the used special query should be replaced
  by the according user input.


.. _SmartQuery: https://docs.searchhub.io/module_smartquery.html
