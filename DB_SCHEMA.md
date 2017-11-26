## Database schema

This document describes the schema of the [IndexedDB][1] object database used to store
the user's documents.

Database | Schema version
---|---
ASCIIMath Editor | 1

The schema defines three object stores:

Object store | Key type | Description | Notes
---|---|---|---
document | auto increment | Stores all documents | Contains pointers to _page_ objects 
page | auto increment | Stores each page of every document | Contains a pointer to a _page_source_ object
page_source | auto increment | Stores the contents of every page

These object stores are defined as follows:

### document

Field | Type | Description | Notes
---|---|---|---
focused_page | Number | The page currently being edited on, which is the target of commands | An index in the _page_keys_ array
page_keys | Array of Numbers | The pages that make up the document (in descending order) | A set of keys in the _page_ object store
scroll | Object | The `window` scroll position
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; top | Number | `window.scrollTop`

### page

Field | Type | Description | Notes
---|---|---|---
page_source_key | Number | The contents of the page | A key in the _page_source_ object store
editor | Object | The `textarea` in the upper, smaller part of the page
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; height | Number | `textarea.style.height`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; selection | Object | The `textarea` selection
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; start | Number | `textarea.selectionStart`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; end | Number | `textarea.selectionEnd`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; scroll | Object | The `textarea` scroll position
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; top | Number | `textarea.scrollTop`
view | Object | The `div` in the lower, bigger part of the page
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; scroll | Object | The `div` scroll positions
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; left | Number | `div.scrollLeft`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; top | Number | `div.scrollTop`

### page_source

Field | Type | Description | Notes
---|---|---|---
value | String | `textarea.value` where `textarea` is the page editor

## Design conventions

* Object store names are singular nouns.
* Object store names are lower snake case.

## Design notes

A single object store with more fields could be used instead of a few different ones.
However, some degree of separation improves concurrency, because differently-scoped
`readwrite` transactions can run in parallel.
In particular, the _page_source_ object store is supposed to serve the highest volume 
of transactions, thus lightening the load on other stores and potentially resulting in
better parallelism among editing and scrolling.

To implement this, the _document_ object store points to the _page_ object
store, which in turn points to the _page_source_ object store. In fact, _page_ and
_page_source_ objects could be fields that are nested inside _document_ objects.
This architecture effectively resembles a [star schema][2] in a SQL database,
in which tables reference other tables by means of some designated key stored
in multiple columns.


  [1]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
  [2]: https://en.wikipedia.org/wiki/Star_schema