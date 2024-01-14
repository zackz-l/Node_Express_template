import AWS from 'aws-sdk';
import {
  MEDIACONVERTER_ENDPOINT,
  S3_BUCKET_NAME,
  AWS_ROLE_ARN
} from '../../config/env-config';

const mediaConvert = new AWS.MediaConvert({
  endpoint: MEDIACONVERTER_ENDPOINT
});

const getMediaConvertTemplate = (
  bucket: string,
  key: string,
  folder: string
) => {
  return {
    UserMetadata: {},
    Role: AWS_ROLE_ARN!,
    Settings: {
      OutputGroups: [
        {
          CustomName: 'MP4',
          Name: 'File Group',
          Outputs: [
            {
              ContainerSettings: {
                Container: 'MP4',
                Mp4Settings: {
                  CslgAtom: 'INCLUDE',
                  FreeSpaceBox: 'EXCLUDE',
                  MoovPlacement: 'PROGRESSIVE_DOWNLOAD'
                }
              },
              VideoDescription: {
                Width: 1280,
                ScalingBehavior: 'DEFAULT',
                Height: 720,
                TimecodeInsertion: 'DISABLED',
                AntiAlias: 'ENABLED',
                Sharpness: 50,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    InterlaceMode: 'PROGRESSIVE',
                    NumberReferenceFrames: 3,
                    Syntax: 'DEFAULT',
                    Softness: 0,
                    GopClosedCadence: 1,
                    GopSize: 90,
                    Slices: 1,
                    GopBReference: 'DISABLED',
                    SlowPal: 'DISABLED',
                    SpatialAdaptiveQuantization: 'ENABLED',
                    TemporalAdaptiveQuantization: 'ENABLED',
                    FlickerAdaptiveQuantization: 'DISABLED',
                    EntropyEncoding: 'CABAC',
                    Bitrate: 3000000,
                    FramerateControl: 'INITIALIZE_FROM_SOURCE',
                    RateControlMode: 'CBR',
                    CodecProfile: 'MAIN',
                    Telecine: 'NONE',
                    MinIInterval: 0,
                    AdaptiveQuantization: 'HIGH',
                    CodecLevel: 'AUTO',
                    FieldEncoding: 'PAFF',
                    SceneChangeDetect: 'ENABLED',
                    QualityTuningLevel: 'SINGLE_PASS',
                    FramerateConversionAlgorithm: 'DUPLICATE_DROP',
                    UnregisteredSeiTimecode: 'DISABLED',
                    GopSizeUnits: 'FRAMES',
                    ParControl: 'INITIALIZE_FROM_SOURCE',
                    NumberBFramesBetweenReferenceFrames: 2,
                    RepeatPps: 'DISABLED',
                    DynamicSubGop: 'STATIC'
                  }
                },
                AfdSignaling: 'NONE',
                DropFrameTimecode: 'ENABLED',
                RespondToAfd: 'NONE',
                ColorMetadata: 'INSERT'
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: 'FOLLOW_INPUT',
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: 'NORMAL',
                      Bitrate: 96000,
                      RateControlMode: 'CBR',
                      CodecProfile: 'LC',
                      CodingMode: 'CODING_MODE_2_0',
                      RawFormat: 'NONE',
                      SampleRate: 48000,
                      Specification: 'MPEG4'
                    }
                  },
                  LanguageCodeControl: 'FOLLOW_INPUT'
                }
              ]
            }
          ],
          OutputGroupSettings: {
            Type: 'FILE_GROUP_SETTINGS',
            FileGroupSettings: {
              Destination: 's3://' + bucket + '/' + folder + '/MP4/'
            }
          }
        },
        {
          CustomName: 'HLS',
          Name: 'Apple HLS',
          Outputs: [
            {
              ContainerSettings: {
                Container: 'M3U8',
                M3u8Settings: {
                  AudioFramesPerPes: 4,
                  PcrControl: 'PCR_EVERY_PES_PACKET',
                  PmtPid: 480,
                  PrivateMetadataPid: 503,
                  ProgramNumber: 1,
                  PatInterval: 0,
                  PmtInterval: 0,
                  Scte35Source: 'NONE',
                  NielsenId3: 'NONE',
                  TimedMetadata: 'NONE',
                  VideoPid: 481,
                  AudioPids: [
                    482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492
                  ]
                }
              },
              VideoDescription: {
                Width: 640,
                ScalingBehavior: 'DEFAULT',
                Height: 360,
                TimecodeInsertion: 'DISABLED',
                AntiAlias: 'ENABLED',
                Sharpness: 50,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    InterlaceMode: 'PROGRESSIVE',
                    NumberReferenceFrames: 3,
                    Syntax: 'DEFAULT',
                    Softness: 0,
                    GopClosedCadence: 1,
                    GopSize: 90,
                    Slices: 1,
                    GopBReference: 'DISABLED',
                    SlowPal: 'DISABLED',
                    SpatialAdaptiveQuantization: 'ENABLED',
                    TemporalAdaptiveQuantization: 'ENABLED',
                    FlickerAdaptiveQuantization: 'DISABLED',
                    EntropyEncoding: 'CABAC',
                    Bitrate: 1000000,
                    FramerateControl: 'INITIALIZE_FROM_SOURCE',
                    RateControlMode: 'CBR',
                    CodecProfile: 'MAIN',
                    Telecine: 'NONE',
                    MinIInterval: 0,
                    AdaptiveQuantization: 'HIGH',
                    CodecLevel: 'AUTO',
                    FieldEncoding: 'PAFF',
                    SceneChangeDetect: 'ENABLED',
                    QualityTuningLevel: 'SINGLE_PASS',
                    FramerateConversionAlgorithm: 'DUPLICATE_DROP',
                    UnregisteredSeiTimecode: 'DISABLED',
                    GopSizeUnits: 'FRAMES',
                    ParControl: 'INITIALIZE_FROM_SOURCE',
                    NumberBFramesBetweenReferenceFrames: 2,
                    RepeatPps: 'DISABLED',
                    DynamicSubGop: 'STATIC'
                  }
                },
                AfdSignaling: 'NONE',
                DropFrameTimecode: 'ENABLED',
                RespondToAfd: 'NONE',
                ColorMetadata: 'INSERT'
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: 'FOLLOW_INPUT',
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: 'NORMAL',
                      Bitrate: 96000,
                      RateControlMode: 'CBR',
                      CodecProfile: 'LC',
                      CodingMode: 'CODING_MODE_2_0',
                      RawFormat: 'NONE',
                      SampleRate: 48000,
                      Specification: 'MPEG4'
                    }
                  },
                  LanguageCodeControl: 'FOLLOW_INPUT'
                }
              ],
              OutputSettings: {
                HlsSettings: {
                  AudioGroupId: 'program_audio',
                  SegmentModifier: '$dt$',
                  IFrameOnlyManifest: 'EXCLUDE'
                }
              },
              NameModifier: '_360'
            },
            {
              ContainerSettings: {
                Container: 'M3U8',
                M3u8Settings: {
                  AudioFramesPerPes: 4,
                  PcrControl: 'PCR_EVERY_PES_PACKET',
                  PmtPid: 480,
                  PrivateMetadataPid: 503,
                  ProgramNumber: 1,
                  PatInterval: 0,
                  PmtInterval: 0,
                  Scte35Source: 'NONE',
                  Scte35Pid: 500,
                  NielsenId3: 'NONE',
                  TimedMetadata: 'NONE',
                  TimedMetadataPid: 502,
                  VideoPid: 481,
                  AudioPids: [
                    482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492
                  ]
                }
              },
              VideoDescription: {
                Width: 1280,
                ScalingBehavior: 'DEFAULT',
                Height: 720,
                TimecodeInsertion: 'DISABLED',
                AntiAlias: 'ENABLED',
                Sharpness: 50,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    InterlaceMode: 'PROGRESSIVE',
                    NumberReferenceFrames: 3,
                    Syntax: 'DEFAULT',
                    Softness: 0,
                    GopClosedCadence: 1,
                    GopSize: 90,
                    Slices: 1,
                    GopBReference: 'DISABLED',
                    SlowPal: 'DISABLED',
                    SpatialAdaptiveQuantization: 'ENABLED',
                    TemporalAdaptiveQuantization: 'ENABLED',
                    FlickerAdaptiveQuantization: 'DISABLED',
                    EntropyEncoding: 'CABAC',
                    Bitrate: 3000000,
                    FramerateControl: 'INITIALIZE_FROM_SOURCE',
                    RateControlMode: 'CBR',
                    CodecProfile: 'MAIN',
                    Telecine: 'NONE',
                    MinIInterval: 0,
                    AdaptiveQuantization: 'HIGH',
                    CodecLevel: 'AUTO',
                    FieldEncoding: 'PAFF',
                    SceneChangeDetect: 'ENABLED',
                    QualityTuningLevel: 'SINGLE_PASS',
                    FramerateConversionAlgorithm: 'DUPLICATE_DROP',
                    UnregisteredSeiTimecode: 'DISABLED',
                    GopSizeUnits: 'FRAMES',
                    ParControl: 'INITIALIZE_FROM_SOURCE',
                    NumberBFramesBetweenReferenceFrames: 2,
                    RepeatPps: 'DISABLED',
                    DynamicSubGop: 'STATIC'
                  }
                },
                AfdSignaling: 'NONE',
                DropFrameTimecode: 'ENABLED',
                RespondToAfd: 'NONE',
                ColorMetadata: 'INSERT'
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: 'FOLLOW_INPUT',
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: 'NORMAL',
                      Bitrate: 96000,
                      RateControlMode: 'CBR',
                      CodecProfile: 'LC',
                      CodingMode: 'CODING_MODE_2_0',
                      RawFormat: 'NONE',
                      SampleRate: 48000,
                      Specification: 'MPEG4'
                    }
                  },
                  LanguageCodeControl: 'FOLLOW_INPUT'
                }
              ],
              OutputSettings: {
                HlsSettings: {
                  AudioGroupId: 'program_audio',
                  SegmentModifier: '$dt$',
                  IFrameOnlyManifest: 'EXCLUDE'
                }
              },
              NameModifier: '_720'
            },
            {
              ContainerSettings: {
                Container: 'M3U8',
                M3u8Settings: {
                  AudioFramesPerPes: 4,
                  PcrControl: 'PCR_EVERY_PES_PACKET',
                  PmtPid: 480,
                  PrivateMetadataPid: 503,
                  ProgramNumber: 1,
                  PatInterval: 0,
                  PmtInterval: 0,
                  Scte35Source: 'NONE',
                  NielsenId3: 'NONE',
                  TimedMetadata: 'NONE',
                  VideoPid: 481,
                  AudioPids: [
                    482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492
                  ]
                }
              },
              VideoDescription: {
                Width: 1920,
                ScalingBehavior: 'DEFAULT',
                Height: 1080,
                TimecodeInsertion: 'DISABLED',
                AntiAlias: 'ENABLED',
                Sharpness: 50,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    InterlaceMode: 'PROGRESSIVE',
                    NumberReferenceFrames: 3,
                    Syntax: 'DEFAULT',
                    Softness: 0,
                    GopClosedCadence: 1,
                    GopSize: 90,
                    Slices: 1,
                    GopBReference: 'DISABLED',
                    SlowPal: 'DISABLED',
                    SpatialAdaptiveQuantization: 'ENABLED',
                    TemporalAdaptiveQuantization: 'ENABLED',
                    FlickerAdaptiveQuantization: 'DISABLED',
                    EntropyEncoding: 'CABAC',
                    Bitrate: 3000000,
                    FramerateControl: 'INITIALIZE_FROM_SOURCE',
                    RateControlMode: 'CBR',
                    CodecProfile: 'MAIN',
                    Telecine: 'NONE',
                    MinIInterval: 0,
                    AdaptiveQuantization: 'HIGH',
                    CodecLevel: 'AUTO',
                    FieldEncoding: 'PAFF',
                    SceneChangeDetect: 'ENABLED',
                    QualityTuningLevel: 'SINGLE_PASS',
                    FramerateConversionAlgorithm: 'DUPLICATE_DROP',
                    UnregisteredSeiTimecode: 'DISABLED',
                    GopSizeUnits: 'FRAMES',
                    ParControl: 'INITIALIZE_FROM_SOURCE',
                    NumberBFramesBetweenReferenceFrames: 2,
                    RepeatPps: 'DISABLED',
                    DynamicSubGop: 'STATIC'
                  }
                },
                AfdSignaling: 'NONE',
                DropFrameTimecode: 'ENABLED',
                RespondToAfd: 'NONE',
                ColorMetadata: 'INSERT'
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: 'FOLLOW_INPUT',
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: 'NORMAL',
                      Bitrate: 96000,
                      RateControlMode: 'CBR',
                      CodecProfile: 'LC',
                      CodingMode: 'CODING_MODE_2_0',
                      RawFormat: 'NONE',
                      SampleRate: 48000,
                      Specification: 'MPEG4'
                    }
                  },
                  LanguageCodeControl: 'FOLLOW_INPUT'
                }
              ],
              OutputSettings: {
                HlsSettings: {
                  AudioGroupId: 'program_audio',
                  IFrameOnlyManifest: 'EXCLUDE'
                }
              },
              NameModifier: '_1080'
            },
            {
              ContainerSettings: {
                Container: 'M3U8',
                M3u8Settings: {
                  AudioFramesPerPes: 4,
                  PcrControl: 'PCR_EVERY_PES_PACKET',
                  PmtPid: 480,
                  PrivateMetadataPid: 503,
                  ProgramNumber: 1,
                  PatInterval: 0,
                  PmtInterval: 0,
                  Scte35Source: 'NONE',
                  NielsenId3: 'NONE',
                  TimedMetadata: 'NONE',
                  VideoPid: 481,
                  AudioPids: [
                    482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492
                  ]
                }
              },
              VideoDescription: {
                Width: 852,
                ScalingBehavior: 'DEFAULT',
                Height: 480,
                TimecodeInsertion: 'DISABLED',
                AntiAlias: 'ENABLED',
                Sharpness: 50,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    InterlaceMode: 'PROGRESSIVE',
                    NumberReferenceFrames: 3,
                    Syntax: 'DEFAULT',
                    Softness: 0,
                    GopClosedCadence: 1,
                    GopSize: 90,
                    Slices: 1,
                    GopBReference: 'DISABLED',
                    SlowPal: 'DISABLED',
                    SpatialAdaptiveQuantization: 'ENABLED',
                    TemporalAdaptiveQuantization: 'ENABLED',
                    FlickerAdaptiveQuantization: 'DISABLED',
                    EntropyEncoding: 'CABAC',
                    Bitrate: 2000000,
                    FramerateControl: 'INITIALIZE_FROM_SOURCE',
                    RateControlMode: 'CBR',
                    CodecProfile: 'MAIN',
                    Telecine: 'NONE',
                    MinIInterval: 0,
                    AdaptiveQuantization: 'HIGH',
                    CodecLevel: 'AUTO',
                    FieldEncoding: 'PAFF',
                    SceneChangeDetect: 'ENABLED',
                    QualityTuningLevel: 'SINGLE_PASS',
                    FramerateConversionAlgorithm: 'DUPLICATE_DROP',
                    UnregisteredSeiTimecode: 'DISABLED',
                    GopSizeUnits: 'FRAMES',
                    ParControl: 'INITIALIZE_FROM_SOURCE',
                    NumberBFramesBetweenReferenceFrames: 2,
                    RepeatPps: 'DISABLED',
                    DynamicSubGop: 'STATIC'
                  }
                },
                AfdSignaling: 'NONE',
                DropFrameTimecode: 'ENABLED',
                RespondToAfd: 'NONE',
                ColorMetadata: 'INSERT'
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: 'FOLLOW_INPUT',
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: 'NORMAL',
                      Bitrate: 96000,
                      RateControlMode: 'CBR',
                      CodecProfile: 'LC',
                      CodingMode: 'CODING_MODE_2_0',
                      RawFormat: 'NONE',
                      SampleRate: 48000,
                      Specification: 'MPEG4'
                    }
                  },
                  LanguageCodeControl: 'FOLLOW_INPUT'
                }
              ],
              OutputSettings: {
                HlsSettings: {
                  AudioGroupId: 'program_audio',
                  IFrameOnlyManifest: 'EXCLUDE'
                }
              },
              NameModifier: '_480'
            }
          ],
          OutputGroupSettings: {
            Type: 'HLS_GROUP_SETTINGS',
            HlsGroupSettings: {
              ManifestDurationFormat: 'INTEGER',
              SegmentLength: 10,
              TimedMetadataId3Period: 10,
              CaptionLanguageSetting: 'OMIT',
              Destination: 's3://' + bucket + '/' + folder + '/HLS/',
              TimedMetadataId3Frame: 'PRIV',
              CodecSpecification: 'RFC_4281',
              OutputSelection: 'MANIFESTS_AND_SEGMENTS',
              ProgramDateTimePeriod: 600,
              MinSegmentLength: 0,
              MinFinalSegmentLength: 0,
              DirectoryStructure: 'SINGLE_DIRECTORY',
              ProgramDateTime: 'EXCLUDE',
              SegmentControl: 'SEGMENTED_FILES',
              ManifestCompression: 'NONE',
              ClientCache: 'ENABLED',
              StreamInfResolution: 'INCLUDE'
            }
          }
        },
        {
          CustomName: 'Thumbnails',
          Name: 'File Group',
          Outputs: [
            {
              ContainerSettings: {
                Container: 'RAW'
              },
              VideoDescription: {
                Width: 1280,
                ScalingBehavior: 'DEFAULT',
                Height: 720,
                TimecodeInsertion: 'DISABLED',
                AntiAlias: 'ENABLED',
                Sharpness: 50,
                CodecSettings: {
                  Codec: 'FRAME_CAPTURE',
                  FrameCaptureSettings: {
                    FramerateNumerator: 1,
                    FramerateDenominator: 10,
                    MaxCaptures: 50,
                    Quality: 80
                  }
                },
                AfdSignaling: 'NONE',
                DropFrameTimecode: 'ENABLED',
                RespondToAfd: 'NONE',
                ColorMetadata: 'INSERT'
              },
              NameModifier: 'Thumbnails'
            }
          ],
          OutputGroupSettings: {
            Type: 'FILE_GROUP_SETTINGS',
            FileGroupSettings: {
              Destination: 's3://' + bucket + '/' + folder + '/Thumbnails/'
            }
          }
        }
      ],
      AdAvailOffset: 0,
      Inputs: [
        {
          AudioSelectors: {
            'Audio Selector 1': {
              Offset: 0,
              DefaultSelection: 'DEFAULT',
              ProgramSelection: 1
            }
          },
          VideoSelector: {
            ColorSpace: 'FOLLOW',
            Rotate: 'AUTO'
          },
          FilterEnable: 'AUTO',
          PsiControl: 'USE_PSI',
          FilterStrength: 0,
          DeblockFilter: 'DISABLED',
          DenoiseFilter: 'DISABLED',
          TimecodeSource: 'EMBEDDED',
          FileInput: 's3://' + bucket + '/' + key
        }
      ]
    }
  };
};

export default class MediaConverter {
  public static async sliceVideo(
    key: string,
    videoId: string
  ): Promise<string> {
    const folder = 'video/' + videoId + '/convert';
    const template = getMediaConvertTemplate(S3_BUCKET_NAME!, key, folder);
    const data = await mediaConvert.createJob(template).promise();
    return data.Job!.Id!;
  }
}
