#!/bin/bash


getLatestTag() {
    REPO="ssh://git@github.com/CommerceExperts/$1"
    git -c 'versionsort.suffix=-' \
        ls-remote --exit-code --refs --sort='version:refname' --tags "$REPO" '*.*.*' \
        | tail --lines=1 \
        | cut --delimiter='/' --fields=3
}

TARGET_BRANCH="gh-pages"
publish() {
    cd _build/html/
    git add --all .
    git commit -m "Update docs with build $BUILD_ID" && git push -u origin "$TARGET_BRANCH" || echo "no changes"
}

substModuleVersions() {
    dir="$1"
    modules=(smartquery smartsuggest)
    for module in ${modules[*]};
    do
        # variable substitution
        TAG="$(getLatestTag "$module")"
        VERSION="${TAG/v/}"
        declare -x $(echo "$module" | tr '[:lower:]' '[:upper:]')_VERSION="$VERSION"
        find "$dir/$module"/ -type f | while read file; do cp "$file" "$file.orig"; <"$file.orig" envsubst > "$file"; rm "$file.orig"; done

    done
}

# build
cd docs/

resetBuildDir() {
    # clear potential old build
    sudo -n chown -R "$(whoami)": _build/
    rm -rf _build/html
    mkdir -p _build/html

    # the very same repository, just a different branch is checkoud in this subdirectory
    git clone --depth 1 --single-branch --branch="$TARGET_BRANCH" -v git@github.com:CommerceExperts/searchhub-docs.git _build/html
}
resetBuildDir

# - replace placeholders, like version numbers etc:
substModuleVersions .

# docker login
AWS_CMD="$(which aws || echo "$HOME/.local/bin/aws")"
$($AWS_CMD ecr get-login --no-include-email --region eu-central-1)

docker run --rm -u root -v "$(pwd)":/docs 399621189843.dkr.ecr.eu-central-1.amazonaws.com/util/sphinx-docs:5.3.0 make html
if [ "$?" -ne 0 ]; then echo "could not generate docs"; exit 1; fi
sudo -n chown -R "$(whoami)": _build/

# fix final docs:
# - add CNAME files

echo -n "docs.searchhub.io" > _build/html/CNAME

# - special case to make 404 page work for all missing links
if [ -e "_build/html/404.html" ]; then
	sed -i 's#<head>#<head>\n  <base href="/">\n#' _build/html/404.html
else
	find _build/ -name 404.html -print0 | xargs -0 -L1 sed -i 's#<head>#<head>\n  <base href="/searchhub-docs/">\n#'
fi

# publish if requested
if [[ "$1" == "publish" ]]; then
    publish
fi
