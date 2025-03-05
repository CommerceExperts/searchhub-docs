Ingestion
=========

searchHub primarily relies on search-analytics data. However, the following types of data are used to further improve the outcome. 

#. Search Analytics Data
#. Curated Queries
#. Product Data

See below what to consider when creating the respective data feeds.

  
1. Search Analytics Data
------------------------

We provide the following methods of ingesting analytics data:

- **Frontend Search Tracking**

- **Google-Analytics, API access.**

- **File exports:**

  - via pull from a URL
  
  - or via secure FTP account access
  
  - In the absence of an analytics system, we offer a log-, or raw-file ingestion service. This professional service extracts the necessary information directly from the respective data source. **Please contact us, to speak about this option or to discuss other options in more detail.**


Frontend Search Tracking
^^^^^^^^^^^^^^^^^^^^^^^^

For the best searchHub integration, we recommend the using our `Search Collector`_ tracking solution. To ensure minimal effort, we offer a shop-specific integration script ready to be embedded. Apply your own data attributes, for a more stable integration. `Read full Search Collector documentation`_ for more details.


Google Analytics API Access
^^^^^^^^^^^^^^^^^^^^^^^^^^^

API access to Google Analytics (UA or GA4) is a secondary option. However, site search tracking is no longer standard in GA4. For this reason, it's necessary to create a custom search-tracking integration within GA4, for it to work.

To connect searchHub to your GA data, please `grant access`_ to at least the 'Viewer' role to the following two accounts:

:: 

    searchhub@searchhub-analytics.iam.gserviceaccount.com
    analytics@commerce-experts.com
    
Once done, please contact us so that we can set up the data-ingestion process on our end.


Analytics File Export
^^^^^^^^^^^^^^^^^^^^^

In the event you are unable to grant API access to your analytics system, a file export is also acceptable. Please make sure to provide these files regulary in order to ensure sustainability and system continuity.

Necessary Export KPIs
"""""""""""""""""""""
Most important for searchHub are user generated search queries (user queries) and their corresponding KPIs. Below is a list of the most useful search KPIs:

- Search-Frequency (Required!)
- Match-Count
- Unique Clicks per Query or click-through-rate / CTR
- Clicks to Basket
- Revenue per Search
- Total-Revenue
- Exit-Rate

These KPIs allow searchHub to make better decisions. Your selection depends upon your search query optimization goal. Ex.: you want to lover the zero-match rate - then "Match Count" must be included in your analytics export.

Data Format
"""""""""""
As a data format, we prefer CSV/TSV feeds that meet the following conditions:

- The export is clearly assigned to a single tenant / shop / sales channel

- Conforms to the following naming convention: 
  ``<custom-prefix>.<tenant>.<date:YYYY-MM-DD>.<file-extension>``

  Explanation to naming convention: 

  - A custom prefix or other custom strings are allowed to be added to the filename, e.g. "export"

  - The tenant (shop, or sales channel) must be part of the file name! See the `glossary`_ concerning what a `tenant`_ is. You can use your own designation, the only requirement is that it must be unique.
    
  - Each export is associated with a certain date. 

    If the export contains data from more than a day, choose the latest date.

The delimiters and the order of the information is not important. The filename must simply contain the necessary information.


2. Curated Queries
------------------

If you have curated landing pages for certain queries or optimized search results, you can export the corresponding queries and searchHub will prefer these and automatically increase the traffic to them.
This can be a simple text file with the name of the tenant (shop or sales channel), e.g. ``curated-queries.<tenant>.txt`` or any other format from which such queries may be easily extracted.


3. Product Data
---------------

Product data should be provided on variant level as CSV file or in the Google-Shopping-Feed-XML format and contain at least the following data fields:

- id (should be identical to what is exposed in the shop frontend)
- title
- image-url
- categories
- brand

optionally we can also use:

- product-type
- attributes
- product-url


**Please contact us directly, if you have other data formats / structures / feeds and no possibility to transform them into the appropriate format.**


.. _glossary: glossary.html
.. _tenant: ../glossary.html#tenant
.. _grant access: https://support.google.com/analytics/answer/1009702?hl=en
.. _Search Collector: /search-collector.html
.. _Read full Search Collector documentation: /search-collector.html
