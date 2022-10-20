/* global R, ZclFrame */

const attrid = ZclFrame.at(1) << 8 | ZclFrame.at(0)
if (attrid === 0x0002) {
  const status = ZclFrame.at(2)
  const dt = status === 0 ? ZclFrame.at(3) : status
  const i = status === 0 ? 4 : 3
  if (dt === 0x41) {
    const len = ZclFrame.at(i)
    if (len >= 4) {
      const mode = ZclFrame.at(i + 2) << 8 | ZclFrame.at(i + 1)
      R.item('state/on').val = ZclFrame.at(i + 3) !== 0
      R.item('state/bri').val = ZclFrame.at(i + 4)
      if (mode === 0x000b && len === 8) {
        R.item('state/x').val = ZclFrame.at(i + 6) << 8 | ZclFrame.at(i + 5)
        R.item('state/y').val = ZclFrame.at(i + 8) << 8 | ZclFrame.at(i + 7)
        if (R.item('state/effect').val === 'colorloop') {
          R.item('state/colormode').val = 'hs'
        } else {
          R.item('state/colormode').val = 'xy'
          R.item('state/effect').val = 'none'
        }
      } else if (mode === 0x000f && len === 10) {
        R.item('state/ct').val = ZclFrame.at(i + 6) << 8 | ZclFrame.at(i + 5)
        R.item('state/x').val = ZclFrame.at(i + 8) << 8 | ZclFrame.at(i + 7)
        R.item('state/y').val = ZclFrame.at(i + 10) << 8 | ZclFrame.at(i + 9)
        R.item('state/colormode').val = 'ct'
        R.item('state/effect').val = 'none'
      } else if (mode === 0x00ab && len === 10) {
        R.item('state/x').val = ZclFrame.at(i + 6) << 8 | ZclFrame.at(i + 5)
        R.item('state/y').val = ZclFrame.at(i + 8) << 8 | ZclFrame.at(i + 7)
        R.item('state/colormode').val = 'xy'
        const effect = ZclFrame.at(i + 10) << 8 | ZclFrame.at(i + 9)
        switch (effect) {
          case 0x8001:
            R.item('state/effect').val = 'candle'
            break
          case 0x8002:
            R.item('state/effect').val = 'fireplace'
            break
          case 0x8003:
            R.item('state/effect').val = 'loop'
            break
          default:
            R.item('state/effect').val = '0x' + effect.toString(16)
            break
        }
      } else if (mode === 0x014b && len >= 10) {
        R.item('state/x').val = ZclFrame.at(i + 6) << 8 | ZclFrame.at(i + 5)
        R.item('state/y').val = ZclFrame.at(i + 8) << 8 | ZclFrame.at(i + 7)
        R.item('state/colormode').val = 'gr'
        R.item('state/effect').val = 'none'
        const vLen = ZclFrame.at(i + 9)
        const nPoints = ZclFrame.at(i + 10) >> 4
        if (nPoints > 0 && len >= 11 + vLen) {
          const maxX = 0.7347
          const maxY = 0.8431
          const map = { points: [] }
          for (let n = 1; n <= nPoints; n++) {
            const point = ZclFrame.at(i + 10 + (3 * n)) << 16 |
              ZclFrame.at(i + 10 + (3 * n) + 1) << 8 |
              ZclFrame.at(i + 10 + (3 * n) + 2)
            const rawX = point & 0x000FFF
            const rawY = (point & 0xFFF000) >> 12
            const x = Math.ceil(rawX * maxX / 0.4095) / 10000
            const y = Math.ceil(rawY * maxY / 0.4095) / 10000
            map.points.push([x, y])
          }
          map.segments = ZclFrame.at(i + 10 + vLen) >> 3
          map.offset = ZclFrame.at(i + 10 + vLen + 1) >> 3
          R.item('state/gradient').val = JSON.stringify(map)
        }
      }
    }
  }
}
