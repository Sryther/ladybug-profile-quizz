# 🐞 Quel type de coccinelle es-tu ?

Un mini-quiz web court et amusant pour animer un événement de l'association
**[Cox Animation](https://www.cox-anim.fr)**. En quelques questions, on découvre
à quelle coccinelle on ressemble le plus, avec une illustration et une petite
blague à la clé.

- 🇫🇷 Entièrement en français
- 🙈 100 % anonyme — aucune donnée personnelle, aucun cookie, aucune persistance
- ⚡ Site statique : HTML/CSS/JS, sans backend ni base de données
- 📱 Responsive et moderne, aux couleurs de l'association

## Structure

```
src/             Le site statique (index.html, styles.css, app.js)
nginx.conf       Config NGINX durcie (port 8080, en-têtes de sécurité)
Containerfile    Image conteneur durcie (NGINX non-root)
chart/           Chart Helm pour un déploiement Kubernetes
```

## Lancer en local

N'importe quel serveur statique suffit :

```bash
cd src && python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Construire et lancer le conteneur

```bash
# Construction (Podman ou Docker)
podman build -t coccinelle-quiz:1.0.0 -f Containerfile .

# Exécution (image non-root, port interne 8080)
podman run --rm -p 8080:8080 coccinelle-quiz:1.0.0
# puis ouvrir http://localhost:8080
```

L'image est volontairement durcie : base NGINX *unprivileged* (utilisateur non
root, UID 101), `server_tokens off`, en-têtes de sécurité, et compatible avec un
système de fichiers en lecture seule (tout ce qui est inscriptible vit sous
`/tmp`).

## Intégration continue (Docker Hub)

Le workflow [`.github/workflows/build-and-push-images.yml`](.github/workflows/build-and-push-images.yml)
construit l'image depuis le `Containerfile` (multi-arch `amd64`/`arm64`) et la
pousse sur **Docker Hub**. Il se déclenche sur **chaque tag Git** de version
(`1.0.0`, ou `v1.0.0` — le `v` est retiré automatiquement) :

```bash
git tag 1.0.0 && git push origin 1.0.0
```

Le pipeline :

1. **meta** — déduit la version du tag et vérifie, parmi tous les tags, s'il
   s'agit de la plus récente (`sort -V`).
2. **build-and-push** — build multi-arch avec SBOM + provenance, publie
   `slashmnt/coccinelle-quiz:<version>`, et ajoute le tag `:latest` si la
   version est la plus haute.
3. **sbom** — génère un SBOM SPDX (artefact téléchargeable).
4. **security-scan** — scan Trivy (OS + librairies) remonté dans l'onglet
   *Security* de GitHub.

Configurer au préalable, dans **Settings → Secrets and variables → Actions** :

| Type | Nom | Description |
| --- | --- | --- |
| Secret | `DOCKERHUB_USERNAME` | Compte Docker Hub utilisé pour `docker login` |
| Secret | `DOCKERHUB_TOKEN` | Jeton d'accès Docker Hub (Account → Security) |
| Variable (option.) | `DOCKERHUB_REPO` | Nom de l'image (défaut : `coccinelle-quiz`) |

Le registre et le dépôt cible sont définis par les variables `REGISTRY`,
`NAMESPACE` (`slashmnt`) et `IMAGE` (`coccinelle-quiz`) en tête du workflow ;
adaptez `NAMESPACE`/`IMAGE` à votre propre espace Docker Hub si besoin.

## Déployer sur Kubernetes

Le chart Helm utilise des ressources standard (`Deployment`, `Service`,
`Ingress`) et applique des `securityContext` durcis.

```bash
# Adapter au minimum le tag et le nom d'hôte (image par défaut : Docker Hub)
helm upgrade --install coccinelle-quiz ./chart \
  --set image.repository=docker.io/slashmnt/coccinelle-quiz \
  --set image.tag=1.0.0 \
  --set ingress.hosts[0].host=coccinelle.cox-anim.fr
```

Valeurs principales (voir `chart/values.yaml`) :

| Clé                 | Défaut                          | Description                          |
| ------------------- | ------------------------------- | ------------------------------------ |
| `replicaCount`      | `2`                             | Nombre de pods                       |
| `image.repository`  | `docker.io/slashmnt/coccinelle-quiz` | Dépôt de l'image                |
| `image.tag`         | `1.0.0`                         | Tag de l'image                       |
| `ingress.enabled`   | `true`                          | Crée un Ingress standard             |
| `ingress.className` | `nginx`                         | Classe d'Ingress                     |
| `ingress.hosts`     | `coccinelle.cox-anim.fr`        | Nom(s) d'hôte                        |
| `ingress.tls`       | `[]`                            | Secrets TLS (ex. via cert-manager)   |

Pour activer le HTTPS avec cert-manager, renseigner `ingress.annotations` et
`ingress.tls` dans un fichier de valeurs.

## Personnaliser le quiz

Tout le contenu (questions, résultats, photos, blagues) se trouve dans
[`src/app.js`](src/app.js) : les objets `QUESTIONS` et `RESULTS`. Les couleurs
sont des variables CSS en haut de [`src/styles.css`](src/styles.css).

## Crédits photos

Les photos des résultats (`src/assets/results/`) proviennent de Wikimedia
Commons et sont sous licence libre. Conformément à ces licences, elles sont
créditées dans l'application et ici :

| Fichier | Espèce | Auteur·e | Licence | Source |
| --- | --- | --- | --- | --- |
| `classique.jpg` | *Coccinella septempunctata* | Flocci Nivis | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [Commons](https://commons.wikimedia.org/wiki/File:20210409_Coccinella_septempunctata_01.jpg) |
| `festive.jpg` | *Psyllobora vigintiduopunctata* | Alex Ashworth-Smith | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [Commons](https://commons.wikimedia.org/wiki/File:Psyllobora_vigintiduopunctata_133118716.jpg) |
| `aventuriere.jpg` | *Harmonia axyridis* | JackyM59 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [Commons](https://commons.wikimedia.org/wiki/File:Coccinelle_asiatique_(Harmonia_axyridis).jpg) |
| `zen.jpg` | *Adalia bipunctata* | Victor Heng | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | [Commons](https://commons.wikimedia.org/wiki/File:Adalia_bipunctata_130075203.jpg) |

> La photo *aventuriere.jpg* étant en CC BY-SA, toute version modifiée doit être
> partagée sous la même licence.

---

Fait avec ❤️ pour **[Cox Animation](https://www.cox-anim.fr)**.
