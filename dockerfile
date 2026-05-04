# Ruby 3.2 matches the GitHub Actions build environment (ruby/setup-ruby@v1 with ruby-version: '3.2.3')
# Uses arm64-native image — no emulation needed on Apple Silicon
FROM ruby:3.2-alpine
RUN apk add --no-cache build-base gcc cmake git
WORKDIR /srv/jekyll
CMD sh -c "bundle install && bundle exec jekyll serve --force_polling --drafts --config _config.yml --host 0.0.0.0"
