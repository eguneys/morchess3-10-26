import './style.css'
import { Loop } from "./loop_input"
import { colors, paths } from "./paths"
import { DragHandler } from './drag'
import { ease, type XY, type XYWH } from './util'
import { Vec2 } from './math/vec2'
import { Spring } from './math/spring'

let cursor_xy: XY

let t: number

let scroll_x: number
let scroll_x_d: number

let Scroll_x_speed = 1
let Scroll_x_d_speed = 0.77

let Fade_duration = 1333


let t_fade_hold: number
let t_fade: number
let next_scene: number
let current_scene: number

const SCENE_1 = 1
const SCENE_2 = 2

let coords_spring = new Spring(50, 5)

let hover_dom_coord: XY | undefined

function _init() {

    t = 0
    cursor_xy = [500, 500]

    scroll_x = 0
    scroll_x_d = 0

    t_fade_hold = 0
    t_fade = 0
    next_scene = SCENE_1

    current_scene = SCENE_2

    hover_dom_coord = undefined
}

function _update(delta: number) {
    t += delta

    if (false) {
        if (on_interval(3000, delta)) {
            next_scene = current_scene === SCENE_1 ? SCENE_2 : SCENE_1
            t_fade = Fade_duration
        }
    }

    if (t_fade_hold > 0) {

    } else {
        if (t_fade > 0) {
            t_fade -= delta

            if (t_fade <= 0) {
                t_fade = 0
            }

            if (next_scene !== current_scene) {
                if (t_fade <= Fade_duration / 2) {
                    current_scene = next_scene
                    t_fade_hold = 400
                }
            }
        }
    }

    if (t_fade_hold > 0) {
        t_fade_hold -= delta

        if (t_fade_hold <= 0) {
            t_fade_hold = 0
        }
    }

    scroll_x += Scroll_x_speed * delta * 0.03

    if (scroll_x > 1000) {
        scroll_x = 0
    }

    scroll_x_d += Scroll_x_d_speed * delta * 0.03

    if (scroll_x_d > 1000) {
        scroll_x_d = 0
    }

    if (drag.is_hovering) {
        cursor_xy = drag.is_hovering
    }

    let old_h = hover_dom_coord

    let [cx, cy, cw, ch] = cursor_box(cursor_xy)
    hover_dom_coord = pos2coords([cx + cw / 2, cy + ch / 2])

    if (old_h?.[0] !== hover_dom_coord?.[0] || old_h?.[1] !== hover_dom_coord?.[1]) {
        coords_spring.pull(5)
    }

    coords_spring.update(delta)
}

const cursor_box = (xy: XY): XYWH => {
    let [x, y] = xy
    return [x + 40, y - 20, 60, 60]
}

const pos2coords = (xy: XY): XY | undefined => {

    let [x, y] = xy

    let f = Math.floor((x - Board_x) / 800 * 8)
    let r = Math.floor((y - Board_y) / 800 * 8)

    if (f < 0 || r < 0 || f >= 8 || r >= 8) {
        return undefined
    }
    return [f, r]
}

function scene1() {

    cx.fillStyle = colors.brown
    cx.fillRect(0, 0, 1920, 1080)
}

let Board_x = 448
let Board_y = 140

function scene2() {

    cx.fillStyle = colors.black
    cx.beginPath()
    cx.roundRect(436, 128, 840, 840, 8)
    cx.fill()


    let x = Board_x
    let y = Board_y
    cx.fillStyle = colors.sand
    cx.fillRect(x - 5, y - 5, 810, 810)

    cx.fillStyle = colors.pink
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 0) continue
            cx.fillRect(x + i * 100, y + j * 100, 100, 100)
        }
    }

    cx.fillStyle = colors.purple
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 1) continue
            cx.fillRect(x + i * 100, y + j * 100, 100, 100)
        }
    }

    for (let i = 0; i < 8; i++) {
        let file = files[i]
        let rank = ranks[i]

        let color_file = colors.white
        let color_rank = colors.white

        let size_file = 0
        let size_rank = 0

        if (hover_dom_coord !== undefined) {
            let a = files[hover_dom_coord[0]]
            let b = ranks[hover_dom_coord[1]]

            if (a === file) {
                color_file = colors.yellow
                size_file = 8 + coords_spring.x
            }

            if (b === rank) {
                color_rank = colors.yellow
                size_rank = 8 + coords_spring.x
            }
        }

        coords(file, 488 + i * 100, 120, color_file, size_file)
        coords(rank, 400, 210 + i * 100, color_rank, size_rank)
    }

}
let files = 'abcdefgh'.split('')
let ranks = '12345678'.split('')

function _render(alpha: number) {

    cx.fillStyle = colors.darkblue
    cx.fillRect(0, 0, 1920, 1080)

    let mx = 33

    let bx = mx - 15
    cx.fillStyle = colors.black
    cx.fillRect(bx, bx, 1920 - bx * 2, 1080 - bx * 2)

    bx = mx - 5
    cx.fillStyle = colors.darkgreen
    cx.fillRect(bx, bx, 1920 - bx * 2, 1080 - bx * 2)


    cx.fillStyle = colors.darkblue
    cx.fillRect(mx, mx, 1920 - mx * 2, 1080 - mx * 2)



    cx.beginPath()
    cx.rect(mx, mx, 1920 - mx * 2, 1080 - mx * 2)
    cx.clip()

    let s_ix = scroll_x + Scroll_x_speed * 16 * 0.03 * alpha
    let s_ix_d = scroll_x_d + Scroll_x_d_speed * 16 * 0.03 * alpha

    cx.globalAlpha = 0.2
    diagonal_scrolling_decoration(paths.pawn, 100, 100, 147, s_ix)
    diagonal_scrolling_decoration(paths.pawn, 500, 500, 147, s_ix)
    diagonal_scrolling_decoration(paths.pawn, 900, 900, 147, s_ix)
    diagonal_scrolling_decoration(paths.pawn, 1300, 1300, 147, s_ix)

    cx.globalAlpha = 0.12
    diagonal_scrolling_decoration(paths.bishop, -30, 0, 17, s_ix_d)
    diagonal_scrolling_decoration(paths.bishop, 390, 390, 17, s_ix_d)
    diagonal_scrolling_decoration(paths.bishop, 750, 750, 77, s_ix_d)
    diagonal_scrolling_decoration(paths.bishop, 1150, 1150, 77, s_ix_d)
    diagonal_scrolling_decoration(paths.bishop, 1570, 1570, 77, s_ix_d)

    cx.globalAlpha = 1


    if (current_scene === SCENE_1) {
        scene1()
    } else if (current_scene === SCENE_2) {
        scene2()
    }


    cursor(...cursor_xy)

    if (t_fade > 0) {
        fade_transition()
    }

}

function coords(coord: string, x: number, y: number, color: Color, size = 0) {
    cx.fillStyle = color
    cx.font = `${42 + size}px ConcertOne`
    cx.shadowColor = colors.black
    cx.shadowBlur = 4
    cx.textBaseline = 'bottom'

    cx.fillText(coord, x, y)
    cx.shadowBlur = 0
}

function on_interval(interval: number, delta: number, offset = 0) {
    let last = Math.floor((t - offset - delta) / interval)
    let next = Math.floor((t - offset) / interval)
    return last < next
}

let tr_reds: XYWH[] = [
    [0, 0, 330, 330],
    [330, 330, 330, 330],
    [200, 200, 80, 80],
    [300, 300, 80, 80],
]
let tr_others: XYWH[] = [
    [330, 0, 330, 330],
    [0, 330, 330, 330],
    [100, 100, 80, 80],
    [200, 200, 80, 80],
    [300, 300, 80, 80],
]



function fade_transition() {

    let i = ease(1 - t_fade / Fade_duration)
    i = Math.min(i, 1 - i) * 2

    cx.fillStyle = colors.black
    
    for (let reds of tr_reds) {
        let [x, y, w, h] = reds
        cx.fillRect(x + w / 2 - w * i / 2, y + h / 2 - h * i / 2, w * i, h * i)
    }

    cx.fillStyle = colors.darkblue
    
    for (let reds of tr_others) {
        let [x, y, w, h] = reds
        cx.fillRect(x + w / 2 - w * i / 2, y + h / 2 - h * i / 2, w * i, h * i)
    }
}

function diagonal_scrolling_decoration(bishop: Path2D, x: number, y: number, size: number, scroll_x: number) {

    let i = scroll_x / 1000

    // 0 -4 === 1 4
    for (let j = -5; j < 5; j+=1) {
        let a = -500 + x + i * 330 * 5
        let b = y - i * 330 * 5

        a += j * 330
        b -= j * 330

        let s = Vec2.make(a, b).distance(Vec2.make(2330, 0)) / 1000 * 100

        piece(bishop, a, b, size + s, { theta: PI * 0.25, color: colors.darkred })
    }
}

const PI = Math.PI

type Color = string

type PieceOptions = {
    theta?: number
    color?: Color
}

function piece(path: Path2D, x: number, y: number, size: number, opts: PieceOptions = {}) {
    let scale = size / 50
    cx.fillStyle = opts.color ?? colors.black
    cx.save()
    cx.translate(x, y)
    if (opts.theta) {
        cx.translate(size / 2, size/2)
        cx.rotate(opts.theta)
        cx.translate(-size/2, -size/2)
    }
    cx.scale(scale, scale)
    cx.fill(path)

    cx.strokeStyle=  opts.color === colors.white ? colors.black : colors.white
    cx.lineWidth = 1
    cx.stroke(path)

    cx.restore()
}

function cursor(x: number, y: number, size: number = 80) {
    let scale = size / 266

    cx.save()
    cx.translate(x, y)
    cx.scale(scale, scale)
    cx.fillStyle = colors.blue
    cx.fill(paths.cursor)

    cx.strokeStyle = colors.white
    cx.lineWidth = 9
    cx.stroke(paths.cursor)
    cx.restore()


    if (DEBUG_COORDS) {
        cx.fillStyle = colors.red
        if (hover_dom_coord)
            cx.fillRect(...cursor_box(cursor_xy))
    }
}

function _after_render() {

}

let drag: DragHandler

let cx: CanvasRenderingContext2D

function init_canvas() {

    let canvas = document.createElement('canvas')

    canvas.width = 1920
    canvas.height = 1080

    cx = canvas.getContext('2d')!

    return canvas
}


async function load_font(font_family: string, url: string, props = {
    style: 'normal',
    weight: '400'
}) {
    const font = new FontFace(font_family, `url(${url})`, props )
    await font.load()
    document.fonts.add(font)
}

async function main(el: HTMLElement) {

    let canvas = init_canvas()
    let $ = document.createElement('div')
    $.classList.add('content')
    canvas.classList.add('interactive')
    $.appendChild(canvas)
    el.appendChild($)

    _init()

    await load_font('ConcertOne', './ConcertOne-Regular.ttf')

    Loop(_update, _render, _after_render)


    drag = DragHandler(canvas)
}


main(document.getElementById('app')!)

let DEBUG_COORDS = false