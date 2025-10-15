import './style.css'
import { Loop } from "./loop_input"
import { colors, paths } from "./paths"
import { DragHandler } from './drag'
import type { XY } from './util'
import { Vec2 } from './math/vec2'

let cursor_xy: XY

let t: number

let scroll_x: number
let scroll_x_d: number

let scroll_x_speed = 1
let scroll_x_d_speed = 0.77

function _init() {

    t = 0
    cursor_xy = [500, 500]

    scroll_x = 0
    scroll_x_d = 0
}

function _update(delta: number) {
    t += delta

    scroll_x += scroll_x_speed

    if (scroll_x > 1000) {
        scroll_x = 0
    }

    scroll_x_d += scroll_x_d_speed

    if (scroll_x_d > 1000) {
        scroll_x_d = 0
    }

    if (drag.is_hovering) {
        cursor_xy = drag.is_hovering
    }
}


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


    cx.globalAlpha = 0.2

    cx.beginPath()
    cx.rect(mx, mx, 1920 - mx * 2, 1080 - mx * 2)
    cx.clip()

    let s_ix = scroll_x - scroll_x_speed * (1- alpha)
    let s_ix_d = scroll_x_d - scroll_x_d_speed * (1- alpha)

    diagonal_scrolling_decoration(paths.pawn, 100, 100, 147, s_ix)
    diagonal_scrolling_decoration(paths.pawn, 500, 500, 147, s_ix)
    diagonal_scrolling_decoration(paths.pawn, 900, 900, 147, s_ix)
    diagonal_scrolling_decoration(paths.pawn, 1300, 1300, 147, s_ix)

    diagonal_scrolling_decoration(paths.bishop, -30, 0, 17, s_ix_d)
    diagonal_scrolling_decoration(paths.bishop, 390, 390, 17, s_ix_d)
    diagonal_scrolling_decoration(paths.bishop, 750, 750, 77, s_ix_d)
    diagonal_scrolling_decoration(paths.bishop, 1150, 1150, 77, s_ix_d)
    diagonal_scrolling_decoration(paths.bishop, 1570, 1570, 77, s_ix_d)



    cx.globalAlpha = 1


    cursor(...cursor_xy)

}

function diagonal_scrolling_decoration(bishop: Path2D, x: number, y: number, size: number, scroll_x: number) {

    let i = scroll_x / 1000

    // 0 -4 === 1 4
    for (let j = -5; j < 5; j++) {
        let a = -500 + x + i * 300 * 5
        let b = y - i * 300 * 5

        a += j * 300
        b -= j * 300

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

function main(el: HTMLElement) {

    let canvas = init_canvas()
    let $ = document.createElement('div')
    $.classList.add('content')
    canvas.classList.add('interactive')
    $.appendChild(canvas)
    el.appendChild($)

    _init()

    Loop(_update, _render, _after_render)


    drag = DragHandler(canvas)
}


main(document.getElementById('app')!)