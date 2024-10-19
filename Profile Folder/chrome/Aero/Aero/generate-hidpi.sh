#!/bin/bash

output="_hidpiAutogen.scss"

echo "/* This file is auto-generated */" > "$output"

begin=1
end=8
p=96

for i in $(seq $((begin * p)) $((end * p)))
do
    scale=$(echo "scale=5; $i/$p" | bc)
    echo "@media (min-resolution: ${i}dpi) { & { --aero-hidpi-scale: $scale; } }" >> "$output"
done
