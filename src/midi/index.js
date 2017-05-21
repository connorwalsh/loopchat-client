import { forEach, get } from 'lodash'
import { MidiEventBus, MIDI_MSG_RECEIVED } from './bus'
import { connectMidiDeviceWith, disconnectMidiDeviceWith } from './connect'
import { DEVICE_STATE_CONNECTED, DEVICE_STATE_DISCONNECTED } from './connect'

/** 
 * setupMIDI provides access to the WebMIDI API and takes a handler
 * for routing the input MIDI data.
 *
 * params: handleMIDIMsg (Function)
 */
export const setupMIDI = (register, unregister) => {

  // ensure that your browser has access to the WebMIDI API
  if (!navigator.requestMIDIAccess) {
    alert('Browser does not support MIDI. Use Chrome for MIDI support.')
    return
  }

  // attempt to gain access to MIDI
  navigator.requestMIDIAccess({
    sysex: false, // do not request system exclusive support
  }).then(
    // we're in business!
    r => initMIDIAccess(r, register, unregister),
  ).catch(
    e => MIDIAccessFailure(e),
  )
}

export let midiEventBus = new MidiEventBus()

const initMIDIAccess = (midi, register, unregister) => {

  // make connect/disconnect functions
  const connect = connectMidiDeviceWith(register, midiEventBus)
  const disconnect = disconnectMidiDeviceWith(unregister)
  const handleStateChange = handleStateChangeWith(connect, disconnect)
  
  // reset midi events bus
  // midiEventBus.flush()
  
  // assign on state change handler
  midi.onstatechange = handleStateChange
  
  // get iterator of devices from midi access
  const inputs = midi.inputs.values()
  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    let device = input.value
    connect(device)
  }
}

const handleStateChangeWith = (connect, disconnect) => event => {
  // on connection/disconnection, connect/disconnect devices
  if (event instanceof MIDIConnectionEvent) {
    // get connected/disconnected device from event
    const device = get(event, 'port')
    switch (device.state) {
    case DEVICE_STATE_CONNECTED:
      connect(device)
      return
    case DEVICE_STATE_DISCONNECTED:
      disconnect(device)
      return
    }
  }  
}

const MIDIAccessFailure = err => console.log(`Could not gain access to MIDI: ${err}`)



// NOTE (cw|5.20.17) this is the code to process the midi data
// msg => {
//   const { data } = msg
//   const toggle = data[0] & 0xf0 // on (144) / off (128) toggle
//   const note = data[1] // note number (5-124)?
//   const vel = data[2] // velocity (0-127)

//   console.log(`Toggle: ${toggle}  Note: ${note}  Velocity: ${vel}`)
// }





