#!/bin/bash
# Download all Saatchi Art product images

IMAGES_DIR="static/uploads/products"
mkdir -p "$IMAGES_DIR"

cd "$IMAGES_DIR"

echo "🖼️  Downloading all 37 product images..."

# Array of all image URLs
declare -a images=(
  "https://images.saatchiart.com/saatchi/115891/art/11537433/10599685-HQJBQDFT-6.jpg|chebu-rasha-throwing-up-eyes.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537421/10599673-MTYMMHQC-6.jpg|chebu-rasha-cloud-sitting.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537401/10599653-PNMOKFTE-6.jpg|chebu-rasha-teletubbies.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537395/10599647-XWKWSQTM-6.jpg|storm-cloud-brains-red-thunder.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537343/10599595-DDNCNTHT-6.jpg|chebu-rasha.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537337/10599589-VDYQPAJJ-6.jpg|red-hills-innocence.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537309/10599561-OXQKECLR-6.jpg|gold-white-breasts.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537293/10599545-QQLHKCRP-6.jpg|chebu-rasha-breasts-teeth.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537287/10599539-GZNPIWBD-6.jpg|golden-cube-nervous-system.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537275/10599527-JUNAFETB-6.jpg|yellow-cube-feet-hands.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537259/10599511-OGIUZEPF-6.jpg|chebu-rasha-blue.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537225/10599477-AQIFFEON-6.jpg|pink-bubbles-long-ears.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11537209/10599461-KPFBVVPU-6.jpg|octopus-head.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11467173/10529427-XSRHBOJY-6.jpg|last-supper-jaws.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11467153/10529407-ASAKKBPG-6.jpg|fire-breathing-chebu-rasha.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11467137/10529391-SXYOUALQ-6.jpg|omniscient-eye.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11460701/10522955-LPNNCGSK-6.jpg|cherry.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11459967/10522221-WTGABWLE-6.jpg|cube-legs.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11459923/10522177-NUOSNXJR-6.jpg|yellow-red-teeth.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11456101/10518355-EXDKFLTC-6.jpg|chebu-rasha-gloves.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11456091/10518345-MOHBNTXW-6.jpg|forest-pink-teeth.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11424817/10487071-NZSBEQCX-6.jpg|the-bull-4.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11424791/10487045-JLNLULCG-6.jpg|the-bull-3.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11424773/10487027-EKDXLGWU-6.jpg|the-bull-2.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11424735/10486989-GEZKBGGB-6.jpg|the-bull.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11383621/10445879-GBNWRISL-6.jpg|clubs.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11383585/10445843-OVIMNJGY-6.jpg|spades.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11383573/10445831-PGBFIDGX-6.jpg|malevich-black-hand.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11383549/10445807-VIHMSWEG-6.jpg|hand-cherry.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/11383545/10445803-FRVCBDZK-6.jpg|squatting-lady.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/10752221/9814691-KWLKJOSD-6.jpg|white-head-black.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/10752049/9814519-HKUGTWRE-6.jpg|red-head-blue.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/8118557/7185102-HSC00002-6.jpg|woman-faunus.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/8118543/7185088-HSC00002-6.jpg|woman-buddha.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/6568535/5638207-HSC00002-6.jpg|mirror-mirror.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/6568507/5638179-LMREUWVN-6.jpg|woman-table.jpg"
  "https://images.saatchiart.com/saatchi/115891/art/281639/139300-HSC00001-6.jpg|reader-princess-pea.jpg"
)

count=0
total=${#images[@]}

for image in "${images[@]}"; do
  IFS='|' read -r url filename <<< "$image"
  count=$((count+1))

  if [ -f "$filename" ]; then
    echo "[$count/$total] ✓ Already exists: $filename"
  else
    echo "[$count/$total] ⬇️  Downloading: $filename"
    curl -L -o "$filename" "$url" --silent --show-error

    if [ $? -eq 0 ]; then
      size=$(du -h "$filename" | cut -f1)
      echo "[$count/$total] ✅ Downloaded: $filename ($size)"
    else
      echo "[$count/$total] ❌ Failed: $filename"
    fi
  fi
done

echo ""
echo "=========================================="
echo "📊 Download Summary:"
echo "  Total images: $total"
echo "  Downloaded: $(ls -1 | wc -l)"
echo "=========================================="
echo ""
echo "✨ Next steps:"
echo "  1. Upload to production via WinSCP:"
echo "     From: $(pwd)"
echo "     To: /opt/websites/k-liee.com/frontend-sveltekit/static/uploads/products/"
echo ""
