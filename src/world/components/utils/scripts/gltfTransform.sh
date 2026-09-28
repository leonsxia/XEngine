#!/bin/bash

read -p "Input gltf folder: " inputFolder
read -p "Input gltf file: " input
read -p "Output gltf folder: " outputFolder
read -p "Output gltf file: " output

tmpFile="tmp.gltf"
optimizeTmpFolder=./"$outputFolder"/optimize_tmp
uastcTmpFolder=./"$outputFolder"/uastc_tmp

mkdir -p "$optimizeTmpFolder"
mkdir -p "$uastcTmpFolder"

gltf-transform optimize ./"$inputFolder"/"$input" "$optimizeTmpFolder"/"$tmpFile" \
    --compress false \
    --texture-compress false \
    --flatten false \
    --join false \
    --weld false \
    --simplify false \
    --verbose

gltf-transform uastc ./"$optimizeTmpFolder"/"$tmpFile" "$uastcTmpFolder"/"$tmpFile" \
    --slots "{baseColorTexture,normalTexture,occlusionTexture,metallicRoughnessTexture,transmissionTexture}" \
    --verbose

gltf-transform etc1s "$uastcTmpFolder"/"$tmpFile" ./"$outputFolder"/"$output" \
    --slots "emissiveTexture" \
    --quality 255 --compression 5 \
    --verbose

gltf-transform inspect ./"$outputFolder"/"$output"

rm -r "$optimizeTmpFolder"
rm -r "$uastcTmpFolder"

read -p "Press Enter to continue..."
exit

chmod +x gltfTransform.sh