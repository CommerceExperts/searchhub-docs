Glossary
========

Query Mapping
-------------

A mapping takes place, if a user query is changed into a search query. The basic mapping data consists of simple mapping rules only. These are indexed by SmartQuery to generate even more mappings using diverse fuzzy algorithms.


Tenant
------

The tenant value is used as an ID and references a single data domain, e.g. a customer domain. The tenant is composed of two values in the format `<name>.<channel>`.
  
  1) the basic "name", which normally would be the customer name
  
  2) a "channel", which provides a second level of segmentation. This can be a separation by language (en, de, ..), for example, or by sales channel (mobile, www, ..).


We recommend a lowercase name only containing alphanumeric characters and optionally dash (`-`) and underscore (`_`) for both tenant values. You can use the shop domain or the combination of your company name and a language code.

In most cases, the tenant is dictated by the provided data. In practice we inform you about the available tenants, as these are used elsewhere in the overarching data processing pipeline, as unique identifiers.

