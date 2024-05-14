.. |searchbox| image:: img/searchbox.png
  :alt: Searchbox Tracking

.. |searchbutton| image:: img/searchbutton.png
  :alt: Searchbutton Tracking

.. |resultCount| image:: img/resultCount.png
  :alt: Result Count Tracking

.. |basketPDP| image:: img/basketPDP.png
  :alt: Add to basket PDP Tracking

.. |basketPLP| image:: img/basketPLP.png
  :alt: Add to basket PLP Tracking

.. |checkout| image:: img/checkout.png
  :alt: Checkout Tracking

.. |product| image:: img/product.png
  :alt: Product Tracking

.. |suggest| image:: img/suggest.png
  :alt: Suggest Tracking

.. |associatedProduct| image:: img/associatedProduct.png
  :alt: Associated Product Tracking

.. |redirectSubSelector| image:: img/redirectSubSelectors.png
  :alt: Tracking Redirects

.. _search-collector: https://github.com/searchhub/search-collector



Search Collector
================
Introduction
############
To gather the required tracking data the open-source search-collector search-collector_ tracking library is used.
The search-collector library scans the HTML DOM to gather search-related data and user events.

To integrate the tracking, only a couple of HTML attributes have to be attached to your page. The remaining search-collector implementation is done by searchHub.

.. note::
   Our tracking script is capable of reading javascript objects to obtain the necessary data.
   To find out more about tracking customizations, just contact us directly or look for a hint in the documentation.

..
   TODO mention the sr is the foundation

Rule of Thumb
#############
*If you are not sure which HTML element exactly to put the data-attribute on, using the elements you use for specific user events is a good rule of thumb.*

*E.g. if your click listener for the search button is attached to an HTML button element, you should add the corresponding collector HTML attribute to that button element.*


Script
######
Include your searchHub tracking snippet on every page in your shop like:

.. code-block:: html

    <script defer src="https://c.searchhub.io/{SCRIPT_ID}"></script>

Replace the ``{SCRIPT_ID}`` with the unique script id searchHub provided for you. The script will automatically load and execute. Please do not confuse the ``SCRIPT_ID`` with the searchHub api key. If you do not have the ``SCRIPT_ID`` please contact your searchHub representative.

Integration
################

Search box
------------------------------
The ``searchbox`` is used to perform text-based queries. In most cases, the ``searchbox`` is an HTML input element.

|searchbox|

.. list-table:: data-attributes
   :widths: 50 50
   :header-rows: 1

   * - Name
     - Value
   * - data-track-id (required)
     - searchBox

**Example**

.. code-block:: html

    <input data-track-id="searchBox" />


Search button
---------------------------------
The ``searchbutton`` is used to trigger a search.

|searchbutton|

.. list-table:: data-attributes
   :widths: 50 50
   :header-rows: 1

   * - Name
     - Value
   * - data-track-id (required)
     - searchButton

**Example**

.. code-block:: html

    <button type="..." data-track-id="searchButton" />


Suggest (search terms)
----------------------------
If search terms are proposed to the shop user while typing, each element containing keywords should be annotated with the ``data-track-id="suggestSearchTerm"`` attribute.

|suggest|

.. list-table:: data-attributes
   :widths: 50 50
   :header-rows: 1

   * - Name
     - Value
   * - data-track-id (required)
     - suggestSearchTerm

**Example**

.. code-block:: html

    ...
    <div data-track-id="suggestSearchTerm">Jeans</div>
    <div data-track-id="suggestSearchTerm">Jeans Jackets</div>
    ...

Result Count
---------------------------------
The writeResult count is the number of products found for the current search (**not** the number of products displayed on the current page). This is usually a somewhat higher number like hundreds or even thousands.

|resultCount|

.. list-table:: data-attributes
   :widths: 50 50
   :header-rows: 1

   * - Name
     - Value
   * - data-track-id (required)
     - resultCountContainer

**Example**

.. code-block:: html

    <div>
        Your search for jeans produced
        <span data-track-id="resultCountContainer">9</span> results
    </div>


Products
----------------------------
A product representation for the current search writeResult. The attributes here include a ``priceContainer`` in addition, the tracking script will automatically strip the non-numeric characters.
The value for the ``data-product-id`` attribute has to be an ID that uniquely identifies the product.
In B2B exist more edge cases. E.g. a certain SKU of the product family is used to represent the product group or family.
In such cases, it is important that the same IDs are used on the product listing page (PDP) and on the product detail page (PLP).
We recommend to use the mainId/parentId for products when possible.

|product|

.. list-table:: data-attributes
   :widths: 50 50
   :header-rows: 1

   * - Name
     - Value
   * - data-track-id (required)
     - product
   * - data-product-id
     - {mainId}
   * - data-track-id
     - priceContainer

.. note::
   Add the `data-*` attributes on category and/or landing pages too. This way searchHub can track KPIs for queries that will trigger a redirect to specific landing pages with best selling products or a category pages instead of the PLP.

.. note::
   You can omit the `data-product-id` and `data-track-id="priceContainer"` attributes if you have a javascript object that contains the required information.
   E.g. the `dataLayer` object. Please contact us if you want to rely on js data.

**Example**

.. code-block:: html

    <a href="..." data-track-id="product" data-product-id="abc" />
        ...
        <div data-track-id="priceContainer">39,99 € per unit</div>
        ...
    </a>


Zero Results Container
---------------------------------
The zero results container is the container that contains the text that is displayed when no products are found for the current search.

.. list-table:: data-attributes
   :widths: 50 50
   :header-rows: 1

   * - Name
     - Value
   * - data-track-id (required)
     - zeroResultsContainer

**Example**

.. code-block:: html

    <div data-track-id="zeroResultsContainer">
        Sorry, no products could be found for your search "search phrase".
    </div>


Redirects and Landing Pages
---------------------------------
When certain search queries trigger a redirect and do not land on the normal search results page, these pages often have banners or other buttons to guide the user more easily through the product assortment.
For example, if you are looking for a specific brand of clothing, the landing page might have banners for the most common categories (Training, Outdoor, Running...).
All buttons and links which lead to other pages that are associated to the initial query (or landing page) have to be labeled with attributes, in order to keep the association to the initial search query.
This can also span several pages. For example, a click on "Outdoor" can land on a subsequent page that again contains buttons and links such as "Jackets", "Bags", "Shoes" and so on.
If a subsequent page does not contain any products for the initial query, the button/link does not have to be labeled.

|redirectSubSelector|

.. list-table:: data-attributes
   :widths: 50 50
   :header-rows: 1

   * - Name
     - Value
   * - data-track-id (required)
     - redirectSubSelector

**Example**

.. code-block:: html

    <a href="/campaign-page/catA" data-track-id="redirectSubSelector">
        Are you interested in our products of Category A
    </a>
    <a href="/campaign-page/catB" data-track-id="redirectSubSelector">
        Are you interested in our products of Category B
    </a>
    <a href="/campaign-page/catC" data-track-id="redirectSubSelector">
        Are you interested in our products of Category C
    </a>
    <!-- PLP, CMS or other content -->


Add to cart (PLP)
----------------------------
Some onlineshops allow the user to put products into basket directly from the PLP. Please add the ``data-track-id`` and ``data-product-id`` attributes to these basket buttons too.
An additional element containing the amount put into the basket can be annotated with the ``data-track-id="addToBasketQuantity"`` attribute, in most cases this is a common div, select or input element.

|basketPLP|

.. list-table:: data-attributes
   :widths: 50 50
   :header-rows: 1

   * - Name
     - Value
   * - data-track-id (required)
     - addToCartPLP
   * - data-product-id
     - {mainId}
   * - data-track-id
     - addToBasketQuantity

.. note::
   You can omit the `data-product-id` and `data-track-id="addToBasketQuantity"` attributes if you have a javascript object that contains the required information.
   E.g. the `dataLayer` object. Please contact us if you want to rely on js data.

**Example**

.. code-block:: html

    <select data-track-id="addToBasketQuantity">...</select>
    <button data-track-id="addToCartPDP" data-product-id="abc"></button>


Add to cart (PDP)
----------------------------
On the product detail page the ``Add to cart`` button has to be attributed with the ``data-track-id`` and ``data-product-id`` attributes.
An additional element containing the amount put into the basket can be annotated with the ``data-track-id`` attribute, in most cases this is a common div, select or input element.

|basketPDP|

.. list-table:: data-attributes
   :widths: 50 50
   :header-rows: 1

   * - Name
     - Value
   * - data-track-id (required)
     - addToCartPDP
   * - data-product-id
     - {mainId}
   * - data-track-id
     - addToBasketQuantity

.. note::
   You can omit the `data-product-id` and `data-track-id="addToBasketQuantity"` attributes if you have a javascript object that contains the required information.
   E.g. the `dataLayer` object. Please contact us if you want to rely on js data.

**Example**

.. code-block:: html

    <select data-track-id="addToBasketQuantity">...</select>
    <button data-track-id="addToCartPDP" data-product-id="abc"></button>


Associated Product
----------------------------
If on product detail page some associated products (recommendations, similar products and so on) are proposed to the shop
user, these products should be annotated almost the same way as products are annotated on the product listing page.
The only difference is the ``associatedProduct`` value of the ``data-track-id`` attribute.

|associatedProduct|

.. list-table:: data-attributes
   :widths: 50 50
   :header-rows: 1

   * - Name
     - Value
   * - data-track-id (required)
     - associatedProduct
   * - data-product-id
     - {mainId}
   * - data-track-id
     - priceContainer

.. note::
   You can omit the `data-product-id` and `data-track-id="priceContainer"` attributes if you have a javascript object that contains the required information.
   E.g. the `dataLayer` object. Please contact us if you want to rely on js data.

**Example**

.. code-block:: html

    <a href="..." data-track-id="associatedProduct" data-product-id="abc" />
        ...
        <div data-track-id="priceContainer">39,99 € per unit</div>
        ...
    </a>

Checkout
----------------------------
Checkout tracking is implemented on the very last summary page in your checkout process.
All products have to be attributed similar to the product listing page in addition to the ``"Commit and Buy"`` button which will finalize the order.

|checkout|

.. list-table:: data-attributes
   :widths: 50 50
   :header-rows: 1

   * - Name
     - Value
   * - data-track-id (required)
     - checkoutProduct
   * - data-track-id (required)
     - checkoutButton
   * - data-product-id
     - {mainId}
   * - data-track-id
     - priceContainer
   * - data-track-id
     - checkoutQuantityContainer

.. note::
   You can omit the `data-product-id`, `data-track-id="priceContainer"` and `data-track-id="checkoutQuantity"` attributes if you have a javascript object that contains the required information.
   E.g. the `dataLayer` object. Please contact us if you want to rely on js data.

**Example**

.. code-block:: html

    <div class="row sCard mb-2" data-track-id="checkoutProduct" data-product-id="1234">
        ...
        <div data-track-id="checkoutQuantity">2</div>
        ...
        <div data-track-id="priceContainer">19.99 €</div>
        ...
    </div>


