# Public searchHub documentation

This is the repository to our public documentation at docs.searchhub.io

## Test locally

To build the html/page locally, make sure to commit your changes (in a separate branch), then run the `build.sh` script. It will reset the project, use our customized `util/shinx-docs` docker-image and after fix the permission of the build output (sudo permission required).

In case you want to do those or some of those steps manually, this is the most important command to build the page:

```
docker run --rm -u root -v "$(pwd)/docs":/docs 399621189843.dkr.ecr.eu-central-1.amazonaws.com/util/sphinx-docs:5.3.1 make html
```

## Staged preview

In case you would like to show the preview internally, you can also deploy that to our preview s3-bucket.
Therefor run this sync command using aws cli:

```
aws s3 sync --delete docs/_build/html/ s3://docs-preview.searchhub.io/
```

Your changes will be visible at the URL [http://docs-preview.searchhub.io.s3-website.eu-central-1.amazonaws.com/](http://docs-preview.searchhub.io.s3-website.eu-central-1.amazonaws.com/)


## Main Structure

- Integration Guide
- Ingestion
  - Analytic Data
  - Product Data
  - Curated Queries

- Search Collector

- Module: smartXXX
  - User Stories
  - Setup
    - Requirements
    - Installation (Dependencies / Image)
    - Client Setup (Quick Start)
    - Troubleshooting

  - Integration
    - API (Endpoints, Models)
    - Instrumenting (+link to Operations &gt; Monitoring)
	  
  - Operations
    - Configuration
    - Monitoring 
      (module specific metrics 
       + link to "General Service Operations &gt; Monitoring")

  - Changelog

- General Service Operations
  - Service Topology
  - Configuration (auth, port, etc)
  - Monitoring (general metrics)

- Glossary
