#!/bin/bash

set -e

if [[ "$KEYFILE" != "" ]] && ! [ -e ~/.ssh/config ]; then
	cat <<GIT_SSH_CONF > ~/.ssh/config
host github.com
 HostName github.com
 IdentityFile $KEYFILE
 User git
GIT_SSH_CONF

	function finish {
		# remove traces
		rm ~/.ssh/config
	}
	trap finish EXIT
fi

# variable substitution
export SEARCHHUB_VERSION=$(git describe --tags  --abbrev=0 | grep -Po '\d+\.\d+(\.\d+)?')
export YEAR=$(date +%Y)
find docs/ -name '*rst' -or -name conf.py | while read file; do cp "$file" "$file.orig"; <"$file.orig" envsubst > "$file"; rm "$file.orig"; done

# list of module repositories. Each repository 
modules=(smartquery smartsuggest)
for module in ${modules[*]};
do
	mod_dir=".${module}_temp"
	git clone -v "git@github.com:CommerceExperts/$module.git" "$mod_dir"
	
	overwriteTag="$(echo $module | tr '[:lower:]' '[:upper:]')_TAG"
	if [[ "${!overwriteTag}" != "" ]]; then
		TAG="${!overwriteTag}"
	else
		TAG="$(cd "$mod_dir" && git describe --tags  --abbrev=0)"
	fi

	if [[ "$TAG" == "" ]]; then
		echo "module $module has no tagged commit! Will exit now." >&2
		exit 1
	fi
	if [[ "$1" != "--skip-last-tag-checkout" ]]; then
		git -C "$mod_dir" checkout "$TAG"
	fi

	if ! [ -d "$mod_dir"/docs ]; then
		echo "module $module does not contain a 'docs' directory! Will exit now." >&2
		exit 1
	fi

	# copy all modules docs file into the $module sub dir
 	mkdir docs/"$module"
	cp "$mod_dir"/docs/* "docs/$module/"

	# get latest version from git tag and export as variable "$MODULE_VERSION"
	VERSION="${TAG/v/}"
	if [[ "$VERSION" == "" ]]; then
		echo "could not extract required modules version. exiting now!" >&2
		exit 1
	fi
	declare -x $(echo "$module" | tr '[:lower:]' '[:upper:]')_VERSION="$(cd "$mod_dir" && git describe --tags  --abbrev=0 | sed 's/v//')"

	# variable substitution
	find docs/"$module"/ -name '*rst' | while read file; do cp "$file" "$file.orig"; <"$file.orig" envsubst > "$file"; rm "$file.orig"; done

	# use the modules index.rst as the modules entrypoint
	mv -f docs/"$module"/index.rst "docs/module_${module}.rst"
done


# build
cd docs/

# clear potential old build
rm -rf _build/html
mkdir -p _build/html

git clone -v git@github.com:CommerceExperts/searchhub-docs.git _build/html

# remove potential old files from public repo that wont be generated anymore
rm -rf _build/html/*
echo -n "docs.searchhub.io" > _build/html/CNAME

# docker login
AWS_CMD="$(which aws || echo "$HOME/.local/bin/aws")"
$($AWS_CMD ecr get-login --no-include-email --region eu-central-1)

docker run --rm -u root -v "$(pwd)":/docs 399621189843.dkr.ecr.eu-central-1.amazonaws.com/util/sphinx-docs:5.3.0 make html
if [ "$?" -ne 0 ]; then echo "could not generate docs"; exit 1; fi

# special case to make 404 page work for all missing links
if [ -e "_build/html/404.html" ]; then
	sed -i 's#<head>#<head>\n  <base href="/searchhub-docs/">\n#' _build/html/404.html
else
	find _build/ -name 404.html -print0 | xargs -0 -L1 sed -i 's#<head>#<head>\n  <base href="/searchhub-docs/">\n#'
fi

# publish
cd _build/html/
git add --all .
git commit -m "Update docs with build $BUILD_ID" && git push -u origin master || echo "no changes"
