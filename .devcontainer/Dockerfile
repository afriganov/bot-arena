ARG VARIANT=24-bookworm
FROM  node:${VARIANT}

ENV PNPM_HOME=/home/node/.local/share/pnpm

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    zsh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
 

RUN npm install -g typescript prettier pnpm

RUN pnpm config set store-dir ${PNPM_HOME}

RUN chsh -s /usr/bin/zsh root
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" --unattended
