Files in this directory are included into searchhub/docs/ with the following rules:

1. This Readme.md (and all other *md files) are ignored. Only *.rst files are considered as official documentation.

2. index.rst is renamed into $module.rst, where "$module" is the name of this repository.
   The title of the index.rst file is used as the title at the table of contents. It should be prefixed with "Module: "

3. all other *.rst files are moved into a "$module/" subdirectory, where "$module" is the name of this repository. 
   This is why the index.rst file should contain a toctree definition that includes "$module/".

# Generate docs

Execute the following cmd in the docs directory:
```
docker run --rm -u root -v "$(pwd)":/doc 399621189843.dkr.ecr.eu-central-1.amazonaws.com/util/sphinx-docs "cd /doc; make html"```