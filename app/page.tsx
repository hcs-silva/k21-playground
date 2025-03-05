"use client"

import type React from "react"

import { useState } from "react"
import { FileUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadVideo } from "@/app/actions"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import exampleResponse1Json from "@/test/example-ouput-small.json"
import exampleResponse2Json from "@/test/example-output-mid.json"


interface ApiResponse {
  base64_data?: string;
  status?: string;
  message?: string;
  success?: boolean;
  result?: Array<{ 
    ocr_text: string;
    time_id?: string;
  }>;
}

export default function VideoUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [wordFrequencies, setWordFrequencies] = useState<[string, number][] | null>(null)

  const calculateWordFrequencies = () => {
    if (!response?.result) return;
    
    // Combine all OCR text and split into words
    const allText = response.result
      .map(frame => frame.ocr_text || '')
      .join(' ')
      .toLowerCase();
    
    const words = allText.match(/\b\w+\b/g) || [];
    
    // Count word frequencies
    const frequencies = words.reduce((acc: { [key: string]: number }, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array and sort by frequency
    const sortedFrequencies = Object.entries(frequencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    setWordFrequencies(sortedFrequencies);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== "video/mp4") {
        setError("Please select an MP4 file")
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("video", file)

      const result = await uploadVideo(formData)
      setResponse(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
    } finally {
      setIsUploading(false)
    }
  }

  const exampleResponse1 = exampleResponse1Json as ApiResponse;
  const exampleResponse2 = exampleResponse2Json as ApiResponse;

  const loadExampleVideo = (exampleNumber: number) => {
    setFile(null);
    setIsUploading(false);
    setError(null);
    setWordFrequencies(null);

    if (exampleNumber === 1) {
      setResponse(exampleResponse1);
    } else if (exampleNumber === 2) {
      setResponse(exampleResponse2);
    }
  };

  const processVideo = async () => {
    setIsProcessing(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For example videos, we can just use the example responses
      if (!file) {
        // If no file is uploaded, we're using an example
        // The response is already set by loadExampleVideo
        setIsProcessing(false);
        return;
      }
      
      // For actual uploaded files, we would process them here
      // This is already handled in handleSubmit, so we don't need to duplicate it
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during processing");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-full px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Kontext21 Playground</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="text-2xl">Capture</CardTitle>
            <CardDescription>Select source material to capture from. 
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preset" className="mb-2 block">Choose from examples</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={() => loadExampleVideo(1)}
                    >
                      Excel Spreadsheet
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={() => loadExampleVideo(2)}
                    >
                      PowerPoint Slide
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video">Select MP4 Video</Label>
                  <div className="flex items-center gap-4">
                    <Input id="video" type="file" accept="video/mp4" onChange={handleFileChange} className="flex-1" />
                    <Button 
                      type="submit" 
                      disabled={!file || isUploading} 
                      className="min-w-[120px] bg-black text-white hover:bg-gray-800"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading
                        </>
                      ) : (
                        <>
                          <FileUp className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <p className="text-sm text-muted-foreground">Max file size: 50MB</p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="text-2xl">Process</CardTitle>
            <CardDescription>
              Extract text from your video frames
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full overflow-auto">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <Button 
                  onClick={processVideo}
                  disabled={isProcessing || (!file && !response)}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process Video"
                  )}
                </Button>
              </div>
              
              {response && (
                <div className="mt-4 space-y-4 flex-grow">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Response:</h3>
                  </div>
                  <div className="rounded-md bg-muted p-4 overflow-auto max-h-[400px]">
                    <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="text-2xl">Consume</CardTitle>
            <CardDescription>
  {response && (
              <div className="mt-8 space-y-4">
                {response.result && (
                  <div className="flex justify-end">
                    <Button
                      onClick={calculateWordFrequencies}
                      className="mb-2 bg-black text-white hover:bg-gray-800"
                    >
                      Analyze Word Frequency
                    </Button>
                  </div>
                )}
                {wordFrequencies && (
                  <div className="mb-4 p-4 bg-muted rounded-md">
                    <h4 className="font-medium mb-4">Top 10 Most Frequent Words:</h4>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={wordFrequencies.map(([word, count]) => ({
                            word,
                            count
                          }))}
                          layout="vertical"
                        >
                          <XAxis type="number" />
                          <YAxis 
                            type="category" 
                            dataKey="word" 
                            width={100}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip />
                          <Bar 
                            dataKey="count" 
                            fill="hsl(var(--primary))"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end mt-6">
        <a
            href="https://github.com/kontext21/k21-playground" 
            target="_blank" 
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            View source code on GitHub
          </a>   
        {response && (
                <Button
                  variant="outline"
                  className="bg-black text-white hover:bg-gray-800"
                  onClick={() => {
                    setFile(null)
                    setResponse(null)
                    setWordFrequencies(null)
                  }}
                >
                  Reset
                </Button>
              )}
      </div>
    </div>
  )
}

