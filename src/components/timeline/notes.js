import React from 'react'
import {filter, map} from 'lodash'
import {
  computeScalingFactors,
  time2Pixel,
  pitch2Pixel,
} from './transformations'
import {
  DEFAULT_NOTE_PIXELS_PER_HEIGHT_PIXELS,
  DEFAULT_NOTE_PIXELS_PER_WIDTH_PIXELS,
} from './constants'

/**
 * renderVisibleNotes takes state information about the current sequence of notes
 * on a timeline along with the dimensional and boundary information for each axis
 * on the timeline UI. Then, the set of notes are filtered down to only the visible
 * notes and transformed into the appropriate coordinate system. This function returns
 * an array of svg elements to be rendered within the timeline svg element.
 */
export const renderVisibleNotes = (notes, view, timeInterval, pitchInterval) => {
  // compute the scaling factors once
  const {xScale, yScale} = computeScalingFactors(view, timeInterval, pitchInterval)

  return map(
    filter(
      notes,
      note =>
        note.start >= timeInterval.start
        && note.start <= timeInterval.end
        && note.pitch >= pitchInterval.start
        && note.pitch <= pitchInterval.end
    ),
    (note, idx) =>
      renderNote(
        time2Pixel(note.start, timeInterval, xScale),
        pitch2Pixel(note.pitch, pitchInterval, yScale),
        view.width * DEFAULT_NOTE_PIXELS_PER_WIDTH_PIXELS,
        view.height * DEFAULT_NOTE_PIXELS_PER_HEIGHT_PIXELS,
        idx
      )
  )
}

/**
 * renderNote takes x/y coordinates, width/height, and a unique id to
 * generate an svg rectange representing a midi note.
 */
const renderNote = (x, y, width, height, id) => {
  const style = {
    fill: '#c9e7db',
  }
  
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      style={style}
      key={id}
      />
  )  
}
