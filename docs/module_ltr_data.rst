LTR Data API
============

Introduction
------------

The LTR Data API provides data sets usable for advanced use-cases of search ranking optimization, such as learning-to-rank or other machine-learning approaches. Currently it offers 3 different types of data, all usable for the assessment and evaluation of products in different e-commerce contexts: 

- :ref:`overall-attractiveness-scores`
- :ref:`search-attractiveness-scores`
- :ref:`overall-trend-scores`

In each data set, products are represented by their ID only, as exposed in the shop frontend to the search-tracking library "search collector".
The scores of each data set is retrieved from data of the same date range and considers product impressions, as well as follow-up interest through clicks and optionally carts. All scores are evaluated using standard statistical tools to ensure high confidence in the provided values. 
The final score values are provided in two different formats: one for multiplication in the range of 0 to 2, and the other for addition in the range of -1 to 1.


.. _overall-attractiveness-scores:

Overall Product Attractiveness Scores
-------------------------------------

This dataset consists of item attractiveness scores for all products, aggregated over all tracked events in search contexts.
The attractiveness score is a weighted combination of two scores: the engagement score and the selling score. The dataset contains scores for all products seen within the defined date range; this means there are also products considered non-attractive, which receive low or negative scores.


**Included Values per Product**:

- EventCounts that were used as a basis for the score: 

  - impressions: An impression is counted when the item is viewed at least once during a session.
  - clicks: A click is counted once per session and search-result, when the detail page of item is viewed
  - carts: A cart is counted once per session and referring search-result, when an item is placed into cart

- engagementScore: Intermediate score representing the level of engagement associated with the item.
- sellingScore: Intermediate score representing the item's likelihood of being sold.
- finalAttractiveness: score in the range 0 to 2, intended for use as a multiplicative ranking factor:

  - Values greater than 1 indicate an attractive item and may be used to boost it.
  - A value of exactly 1 is neutral and leaves the original score unchanged.
  - Values below 1 indicate an underperforming item and may be used to penalize it.

- adjustedScore: Additive representation of the final attractiveness score, normalized to the range -1 to 1.


.. _search-attractiveness-scores:

Search-Specific Product Attractiveness Scores
---------------------------------------------

This dataset consists of item attractiveness scores for products in the context of specific search results. Search results are represented as unified queries as seen in the according date range.
The attractiveness score is a weighted combination of two scores: the engagement score and the selling score, both evaluated in the context of queries. Therefore, a single product can be evaluated several times if seen in different search results.
The dataset contains scores for all products that reach a certain threshold during the defined date range; this means there are also products considered non-attractive, which receive low or negative scores in the corresponding context.


**Included Values per Product and Query**:

*Same as for the* :ref:`overall-attractiveness-scores`

   
.. _overall-trend-scores:

Product Trend Scores
--------------------

This dataset consists of item trend scores for all products, aggregated over all search contexts. That score represent whether a product is gaining or losing popularity by comparing its recent performance to a previous time period.
The trend score is the result of several weighted features which are included in the dataset. The weights are continuously tuned by standard machine learning approaches to achieve highly confident values.
Scores are only exposed for products where an upward or downward trend could be detected. Low or negative scores are exposed for products that show decreasing interest.


**Included Values per Product**

- velocityScore: Intermediate score representing the rate of change between the previous observation period and the current observation period.
- qualityScore: Intermediate score representing the consistency of the item's performance throughout the observation period.
- volatilityScore: Intermediate score representing the volatility of the item's performance, typically based on its standard deviation.
- riskScore: Intermediate score representing the level of uncertainty associated with the item's trend assessment.
- upsideScore: Intermediate score used to smooth the item's attractiveness score based on the number of impressions it received.
- accelerationScore: Intermediate score representing the acceleration of the item's trend, calculated as the rate of change of the velocity score.
- impressionVelocityScore: Intermediate score representing the rate of change in the item's impressions.
- impressionAccelerationScore: Intermediate score representing the acceleration of the item's impressions, calculated as the rate of change of the impression velocity score.
- shareVelocityScore: Intermediate score representing the item's velocity relative to the overall velocity of the shop.
- finalAttractiveness: score in the range 0 to 2, intended for use as a multiplicative ranking factor:

  - Values greater than 1 indicate an attractive item and may be used to boost it.
  - A value of exactly 1 is neutral and leaves the original score unchanged.
  - Values below 1 indicate an underperforming item and may be used to penalize it.

- adjustedScore: Additive representation of the final attractiveness score, normalized to the range -1 to 1.



