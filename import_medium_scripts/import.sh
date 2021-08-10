# npm install -g https://github.com/jamischarles/export-medium-to-gatsby

# run it from inside the import_medium_scripts directory
# cd import_medium_scripts
# ./import.sh

#remove previous content
rm -Rf  ../content/blog/*
rm -Rf  ../.cache/*

#import  previous content
medium2gatsby ~/Downloads/medium-export/posts -o ../content/blog/ -t template.js