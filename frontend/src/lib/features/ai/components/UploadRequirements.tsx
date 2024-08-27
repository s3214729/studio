import { authAxios } from "$auth/state/auth";
import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    Textarea,
} from "@mui/joy";
import React, { useState, useEffect } from "react";
import { Pipeline } from "../types";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "$shared/hooks/queryClient";
import { Mic, MicOff } from "lucide-react";

type Props = {
    pipeline: Pipeline;
};

export const UploadRequirements: React.FC<Props> = ({ pipeline }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [requirements, setRequirements] = useState(pipeline.requirements);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const [recordedFile, setRecordedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { mutate: submitRequirements } = useMutation({
        mutationFn: async (requirements: string) => {
            await authAxios.post(
                `/v1/prose/pipelines/${pipeline.id}/requirements/`,
                { requirements }
            );
            queryClient.invalidateQueries({ queryKey: ["pipelines"] });
        },
    });

    const { mutate: transcribeAudio } = useMutation({
        mutationFn: async (file) => {
            console.log('Audio data type:', file.constructor.name);


            // Create FormData to include the file with the expected field name
            const formData = new FormData();
            formData.append('input_audio', file);

            // Debugging: Log the FormData content
            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            console.log('Starting API request...');
            try {
                const response = await authAxios.post('/v1/prose/audio/stt', formData);
                console.log('Received response:', response);
                console.log('Response Data:', response.data.text);
                const transcription = response.data.text;
                console.log('transcription:', transcription);
                return transcription;
            } catch (error) {
            console.error('Error during transcription:', error);
            }
            console.log('API request finished.');
        },
        onSuccess: (transcription) => {
            if (transcription) {  // Check if transcription is not undefined or empty
                setRequirements(prev => prev + transcription);
                console.log('Transcription:', transcription);
            } else {
                console.log('Received undefined transcription, nothing will be appended.');
            }
        },
        onError: (error) => {
            console.error("Error during transcription:", error);
        }
    });

    useEffect(() => {
        if (isRecording) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const recorder = new MediaRecorder(stream);
                    setMediaRecorder(recorder);
                    setAudioStream(stream);

                    recorder.ondataavailable = (event) => {
                        // This event will provide the final Blob after the recording stops
                        if (event.data.size > 0) {
                            const file = new File([event.data], 'audio.webm', { type: event.data.type });
                            console.log('File Object:', file);
                            setRecordedFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                            // Send the file to the server once recording stops
                            transcribeAudio(file);
                        }
                    };

                    recorder.start();
                    // Stop the recording after a certain duration or when isRecording becomes false
                    recorder.onstop = () => {
                        console.log("Recording stopped.");
                    };

                })
                .catch(error => console.error("Error accessing audio stream:", error));
        } else if (mediaRecorder) {
            mediaRecorder.stop();
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
        }

        return () => {
            if (mediaRecorder) {
                mediaRecorder.stop();
            }
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isRecording, transcribeAudio]);

    const handleButtonClick = () => {
        setIsRecording(prev => !prev);
    };

    return (
        <form
            className="flex w-full flex-col gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                if (requirements) submitRequirements(requirements);
            }}
        >
            <FormControl>
                <FormLabel>Requirements</FormLabel>
                <div className="relative">
                    <Textarea
                        minRows="12"
                        name="requirements"
                        required
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="Enter your requirements text here."
                        style={{ paddingRight: '35px' }} //
                    />
                    <button
                        id="speechinput"
                        type="button"
                        className="absolute top-2 right-2 bg-gray-200 rounded-full p-2"
                        onClick={handleButtonClick}
                    >

                        {isRecording ? (
                            <MicOff style={{ color: 'red', fontSize: 24 }} /> // Red Mic icon when recording
                        ) : (
                            <Mic style={{ color: 'black', fontSize: 24 }} /> // Black MicOff icon when not recording
                        )}
                    </button>
                </div>
                <FormHelperText>
                    Enter your requirements text here.
                </FormHelperText>
            </FormControl>
            {recordedFile && (
                <div className="mt-4">
                    <h3>Recorded Audio</h3>
                    <audio controls src={previewUrl} />
                </div>
            )}
            <Button type="submit" color="primary">
                Submit
            </Button>
        </form>
    );
};
