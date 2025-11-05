from instrument import Instrument
from one_liner.server import RouterServer
from time import sleep


if __name__ == "__main__":
    instrument = Instrument()
    server = RouterServer(devices={"prototome": instrument})

    stream_data_channels = \
        {"prototome_stage_positions": (15, instrument.get_positions, None, None),
         "prototome_stage_velocities": (15, instrument.get_velocities, None, None),
         "prototome_stage_travel": (15, instrument.get_travel_ranges, None, None),
         "prototome_exposure": (15, instrument.cameras["web_camera"].get_exposure_time, None, None),
         "prototome_gain": (15, instrument.cameras["web_camera"].get_gain, None, None),
         "new_frame": (30, instrument.grab_frame, ["web_camera"], None)
         }
    for channel_name, func_w_params in stream_data_channels.items():
        freq, func, args, kwargs = func_w_params
        server.add_stream(channel_name, freq, func, args=args, kwargs=kwargs,
                          enabled=True)

    #rpc_data_channels = \
    #    {
    #     "prototome_stage_travel": instrument.get_range,
    #     "prototome_start_camera": instrument.start_camera,
    #     "prototome_stop_camera": instrument.stop_camera,
    #     "prototome_exposure": instrument.set_exposure_time,
    #     "prototome_gain": instrument.set_gain
    #    }
    #for channel_name, func in rpc_data_channels.items():
    #    pass

    server.run()
    while True:
        sleep(0.1)

