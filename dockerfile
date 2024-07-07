# from my digging the github action uses jekyll 3.9.5 but that doesn't exist on dhub... 
# https://github.com/jekyll/jekyll/issues/9066 - issue with webrick gem - downgrade version
FROM jekyll/jekyll:3.8.5
CMD jekyll serve --force_polling --drafts