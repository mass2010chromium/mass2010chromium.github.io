function aabb_contains(min_x, max_x, min_y, max_y, px, py) {
    return px > min_x && px < max_x && py > min_y && py < max_y;
}

function aabb_intersects(base, data2) {
    const min_x = base.x - base.w/2;
    const max_x = base.x + base.w/2;
    const min_y = base.y;
    const max_y = base.y + base.h;
    for (const [x, y] of [
        [data2.x - data2.w/2, data2.y],
        [data2.x + data2.w/2, data2.y],
        [data2.x - data2.w/2, data2.y + data2.h],
        [data2.x + data2.w/2, data2.y + data2.h]
    ]) {
        if (aabb_contains(min_x, max_x, min_y, max_y, x, y)) {
            return true;
        }
    }
    return false;
}

function move_resolve_collision(data, others) {
    // convention: 0, 0 is middle bottom
    // This is not fully correct -- allows "phasing through" obstacles or corners.
    // However I cba to think about line collision right now :skull:
    const next_tick = {
        x: data.x + data.vx,
        y: data.y + data.vy,
        w: data.w,
        h: data.h
    };
    let collide_events = [];
    let impact_x_t = 999;
    let _impact_x;
    let impact_x_targets = [];
    let impact_y_t = 999;
    let _impact_y;
    let impact_y_targets = [];
    let contacts = [false, false, false, false];
    for (const other of others) {
        if (aabb_intersects(next_tick, other) || aabb_intersects(other, next_tick)) {
            let leading_x = data.x + (data.vx > 0 ? data.w/2 : -data.w/2);
            let leading_y = data.y + (data.vy > 0 ? data.h : 0);
            let impact_x = other.x + (data.vx > 0 ? -other.w/2 : other.w/2);
            let impact_y = other.y + (data.vy > 0 ? 0 : other.h);
            if (data.vx != 0) {
                let dt = (impact_x - leading_x) / data.vx;
                if (dt >= 0 && dt <= impact_x_t) {
                    if (dt < impact_x_t) {
                        impact_x_targets = [other];
                    }
                    else {
                        impact_x_targets.push(other);
                    }
                    impact_x_t = dt;
                }
            }
            if (data.vy != 0) {
                let dt = (impact_y - leading_y) / data.vy;
                if (dt >= 0 && dt <= impact_y_t) {
                    if (dt < impact_y_t) {
                        impact_y_targets = [other];
                    }
                    else {
                        impact_y_targets.push(other);
                    }
                    impact_y_t = dt;
                }
            }
        }
    }
    let vx_remain = 0;
    let vy_remain = 0;
    if (impact_x_targets.length) {
        data.x += 0.99*data.vx * impact_x_t;
        vx_remain = data.vx - data.vx * impact_x_t;
    }
    else {
        data.x += data.vx;
    }
    if (impact_y_targets.length) {
        data.y += 0.99*data.vy * impact_y_t;
        vy_remain = data.vy - data.vy * impact_y_t;
    }
    else {
        data.y += data.vy;
    }

    if (impact_x_targets.length) {
        const x_move = {
            x: data.x + vx_remain,
            y: data.y,
            w: data.w,
            h: data.h
        };
        let repeat_check = false;
        for (const target of impact_x_targets) {
            if (aabb_intersects(x_move, target) || aabb_intersects(target, x_move)) {
                repeat_check = true;
                break;
            }
        }
        if (repeat_check) {
            if (impact_x_t <= impact_y_t) {
                if (data.vx > 0) {
                    contacts[0] = true;
                }
                else if (data.vx < 0) {
                    contacts[1] = true;
                }
            }
            data.vx = 0;
        }
        else {
            data.x = x_move.x;
        }
    }

    if (impact_y_targets.length) {
        const y_move = {
            x: data.x,
            y: data.y + vy_remain,
            w: data.w,
            h: data.h
        };
        let repeat_check = false;
        for (const target of impact_y_targets) {
            if (aabb_intersects(y_move, target) || aabb_intersects(target, y_move)) {
                repeat_check = true;
                break;
            }
        }
        if (repeat_check) {
            if (impact_y_t <= impact_x_t) {
                if (data.vy > 0) {
                    contacts[2] = true;
                }
                else if (data.vy < 0) {
                    contacts[3] = true;
                }
            }
            data.vy = 0;
        }
        else {
            data.y = y_move.y;
        }
    }
    data.contacts = contacts;
}
