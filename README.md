# VPC Visual

An animated, beginner-friendly diagram that explains an **AWS VPC** step by step, using a story a non-IT person can follow: a shop owner, **Divyapriya**, builds a gated housing society. No build step, no dependencies.

| Technical term | Plain-language analogy |
|---|---|
| VPC | Fenced plot |
| Subnet | Lobby (public) / private flats |
| Internet Gateway | Main gate |
| NAT Gateway | Delivery counter |
| Security Group | Door guard |
| NACL | Gate guard |
| Load Balancer | Receptionist |
| VPN | Secret tunnel |
| VPC Peering | Private road |

## The moving objects

| Packet | Meaning |
|---|---|
| ✉️ | Visitor request |
| 💾 | Data |
| 🔁 | Database replication |
| 📦 | Software update |
| 😈 | Intruder |
| 🔒 | Office VPN |
| 🤝 | Partner peering |

## The 9 steps

1. **VPC** - AWS Cloud region and the VPC box (10.0.0.0/16)
2. **Availability Zones** - two buildings, A and B
3. **Subnets** - public (gold) and private (purple) in each zone
4. **Internet Gateway** - the Internet, Visitors, route table and a first envelope
5. **Load balancer + web servers** - requests shared between zones
6. **App servers + database** - data flows web, app, database, with a live copy in zone B
7. **NAT Gateway** - a software update leaves via NAT and the gate
8. **Security** - SG guards, NACL guards, and a blocked intruder
9. **VPN + Peering** - office tunnel to the private subnet, and a partner VPC

Click a step to see it and everything before it. Use **Auto-play** (5 seconds per step) or **Reset**.

## Run locally

```bash
cd vpc-visual
python3 -m http.server 8000
# open http://localhost:8000
```

## Host on GitHub Pages

1. Create a new repository on GitHub and upload the contents of this folder (including the hidden `.nojekyll` file).
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main** and folder **/ (root)**, then click **Save**.
5. Wait a minute; your site appears at `https://<your-username>.github.io/<repo-name>/`.

## Project structure

```
vpc-visual/
  index.html     page structure only
  css/style.css  page + diagram styling, light/dark, reduced motion
  js/app.js      SVG helper functions, step data, caption text
  .nojekyll      tells GitHub Pages to serve files as-is
  LICENSE        MIT (replace "Divyapriya" with your name)
  README.md
```

## Customise

- **Text:** edit the `STEPS` array at the top of `js/app.js` (title, subtitle, plain words, technical name, what to watch) and `LEGEND`.
- **Diagram:** the `add('n'|'w'|'p', stepNumber, ...)` calls in `js/app.js` place nodes, wires and packets for each step.
- **Colours:** change the page variables in `:root` in `css/style.css`, and the diagram classes (`.pub`, `.priv`, `.vpc`, `.n-gold`, `.w-r`, ...) in the SVG section of the same file.
- **Motion:** it respects `prefers-reduced-motion`.
