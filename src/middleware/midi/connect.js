import {get, pick} from 'lodash'
import {registerMidiDevice, unregisterMidiDevice} from '../../redux/actions/midiDevices/index'

export const DEVICE_STATE_CONNECTED = 'connected'
export const DEVICE_STATE_DISCONNECTED = 'disconnected'

export const connect = (midiEventBus, store) => {

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
    r => midiAccessSuccess(r, midiEventBus, store),
  ).catch(
    e => midiAccessFailure(e),
  )
}

const midiAccessSuccess = (midi, midiEventBus, store) => {

  // make connect/disconnect functions
  const connect = connectMidiDeviceWith(store.dispatch, midiEventBus)
  const disconnect = disconnectMidiDeviceWith(store.dispatch)
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

export const connectMidiDeviceWith = (dispatch, midiBus) => device => {
  // get device copy
  const deviceCopy = pick(device, ['id', 'name', 'manufacturer', 'type', 'state'])

  // register connected device using curried register function
  dispatch(registerMidiDevice(deviceCopy))

  // forward onmidimessage events to midi bus
  device.onmidimessage = event => midiBus.process(event)

  console.info(
    `%cConnected --> %c${device.name}`,
    'color:green; font-weight:bold',
    'color:purple; font-weight:bold',
  )
}

export const disconnectMidiDeviceWith = dispatch => device => {
  // unregister disconnected device using curried unregister function
  dispatch(unregisterMidiDevice(device))

  console.info(
    `%cDisconnected -/-> %c${device.name}`,
    'color:red; font-weight:bold',
    'color:purple; font-weight:bold',
  )
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

const midiAccessFailure = err => console.log(`Could not gain access to MIDI: ${err}`)
