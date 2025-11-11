
"use client";

import * as React from "react";
import { useState, useEffect, useTransition, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import QRCode from "qrcode.react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Shield, ShieldHalf, ShieldCheck, Download, FileJson, FileText, QrCode, GitCompareArrows, Upload, Lightbulb, Dices, FileDown, ShieldQuestion, Trash2, History, Paintbrush, Palette, Moon, Sun, Laptop, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { md5 } from "@/lib/md5";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme } from "next-themes"

const algorithms = [
  {
    id: "md5",
    label: "MD5",
    icon: <Shield size={20} className="text-accent" />,
  },
  {
    id: "sha256",
    label: "SHA-256",
    icon: <ShieldHalf size={20} className="text-accent" />,
  },
  {
    id: "sha512",
    label: "SHA-512",
    icon: <ShieldCheck size={20} className="text-accent" />,
  },
];

type HashHistoryItem = {
  id: string;
  timestamp: string;
  input: string;
  algorithm: string;
  hash: string;
};

async function generateHashInternal(text: string, algorithm: string, salt: string = '', saltPosition: 'prefix' | 'postfix' = 'prefix') {
  const textToHash = saltPosition === 'prefix' ? salt + text : text + salt;
  if (textToHash === "") {
    return "";
  }
  let hash = "";
  if (algorithm === "md5") {
    hash = md5(textToHash);
  } else {
    const algoName = algorithm.toUpperCase().replace("SHA", "SHA-");
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw new Error('Crypto API not available');
    }
    const msgUint8 = new TextEncoder().encode(textToHash);
    const hashBuffer = await crypto.subtle.digest(algoName, msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return hash;
}


function HashGeneratorTool() {
  const [inputText, setInputText] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("sha256");
  const [hashedOutput, setHashedOutput] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [useSalt, setUseSalt] = useState(false);
  const [salt, setSalt] = useState("");
  const [saltPosition, setSaltPosition] = useState<'prefix' | 'postfix'>("prefix");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [history, setHistory] = useState<HashHistoryItem[]>([]);
  
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("hashHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Could not load history from localStorage", error);
    }
  }, []);

  const addToHistory = (item: Omit<HashHistoryItem, 'id' | 'timestamp'>) => {
    const newHistoryItem: HashHistoryItem = {
      ...item,
      id: new Date().toISOString() + Math.random(),
      timestamp: new Date().toLocaleString(),
    };
    const updatedHistory = [newHistoryItem, ...history].slice(0, 50); // limit history to 50 items
    setHistory(updatedHistory);
    try {
      localStorage.setItem("hashHistory", JSON.stringify(updatedHistory));
    } catch (error) {
       console.error("Could not save history to localStorage", error);
    }
  };

  const generateAndSetHash = useCallback(async () => {
      if (!inputText) {
        setHashedOutput("");
        return;
      }
      try {
        const finalSalt = useSalt ? salt : "";
        const hash = await generateHashInternal(inputText, selectedAlgorithm, finalSalt, saltPosition);
        setHashedOutput(hash);
        addToHistory({
          input: inputText,
          algorithm: selectedAlgorithm,
          hash: hash,
        });
      } catch (error) {
        console.error("Hashing failed:", error);
        let description = "Could not generate hash. Please try again.";
        if (error instanceof Error && error.message.includes('Crypto')) {
          description = "Secure context required. This feature works best on localhost or HTTPS.";
        }
        
        setHashedOutput("Error generating hash.");
        toast({
          title: "Hashing Error",
          description: description,
          variant: "destructive",
        });
      }
    }, [inputText, selectedAlgorithm, useSalt, salt, saltPosition]);


  useEffect(() => {
    const handler = setTimeout(() => {
       startTransition(() => {
        generateAndSetHash();
      });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputText, selectedAlgorithm, useSalt, salt, saltPosition, generateAndSetHash]);
  
  const generateRandomSalt = () => {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const randomSalt = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    setSalt(randomSalt);
    toast({ title: "Generated random salt!" });
  };

  const handleCopy = async () => {
    if (!hashedOutput || isPending || hashedOutput.startsWith("Error")) return;
    try {
      await navigator.clipboard.writeText(hashedOutput);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy hash to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (format: "txt" | "json" | "qr") => {
    if (!hashedOutput || isPending || hashedOutput.startsWith("Error")) return;

    if (format === 'qr') {
        const canvas = document.querySelector<HTMLCanvasElement>('#qr-code-canvas');
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${selectedAlgorithm}_hash.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
             toast({ title: "QR Code downloaded!" });
        }
        return;
    }

    let content = "";
    let mimeType = "";
    let filename = "";

    if (format === "txt") {
      content = hashedOutput;
      mimeType = "text/plain";
      filename = `${selectedAlgorithm}_hash.txt`;
    } else if (format === "json") {
      content = JSON.stringify({
        text: inputText,
        algorithm: selectedAlgorithm,
        hash: hashedOutput,
        ...(useSalt && { salt, saltPosition }),
      }, null, 2);
      mimeType = "application/json";
      filename = `${selectedAlgorithm}_hash.json`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded " + filename });
  };


  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="text-input" className="font-semibold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Input Text
        </Label>
        <Textarea
          id="text-input"
          placeholder="Type or paste your text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[120px] sm:min-h-[150px] text-base focus:ring-accent resize-none"
          aria-label="Text to hash"
        />
      </div>
      
      <div className="space-y-4 rounded-lg border border-border p-4 bg-secondary/30">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <ShieldQuestion size={20} className="text-accent" />
                    <Label htmlFor="salt-switch" className="font-semibold">Salt / Pepper</Label>
                </div>
                <Switch id="salt-switch" checked={useSalt} onCheckedChange={setUseSalt} />
            </div>
            {useSalt && (
                <div className="space-y-4 pt-4 border-t border-dashed">
                     <div className="relative">
                        <Label htmlFor="salt-input" className="font-medium">Custom Value</Label>
                        <Input id="salt-input" placeholder="Enter custom salt/pepper or generate one" value={salt} onChange={(e) => setSalt(e.target.value)} className="pr-10 mt-2" />
                        <Button variant="ghost" size="icon" className="absolute right-1 bottom-1 h-8 w-8" onClick={generateRandomSalt} title="Generate random salt"><Dices size={18}/></Button>
                    </div>
                    <div>
                        <Label className="font-medium block mb-3">Position</Label>
                         <RadioGroup
                            value={saltPosition}
                            onValueChange={(value) => setSaltPosition(value as 'prefix' | 'postfix')}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                             <Label className="flex items-center space-x-3 p-3 rounded-md border-2 border-transparent bg-secondary cursor-pointer hover:border-primary/50 transition-all text-sm">
                                <RadioGroupItem value="prefix" id="prefix" />
                                <span>Prefix (salt + text)</span>
                             </Label>
                             <Label className="flex items-center space-x-3 p-3 rounded-md border-2 border-transparent bg-secondary cursor-pointer hover:border-primary/50 transition-all text-sm">
                                <RadioGroupItem value="postfix" id="postfix" />
                                <span>Postfix (text + salt)</span>
                             </Label>
                        </RadioGroup>
                    </div>
                </div>
            )}
        </div>

        <div className="space-y-3">
          <Label className="font-semibold flex items-center gap-2">
            <Dices className="h-4 w-4" />
            Select Algorithm
          </Label>
          <RadioGroup
            value={selectedAlgorithm}
            onValueChange={setSelectedAlgorithm}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {algorithms.map((algo) => (
              <Label
                key={algo.id}
                htmlFor={algo.id}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-lg border-2 border-transparent bg-secondary/50 cursor-pointer hover:border-primary/50 transition-all",
                  selectedAlgorithm === algo.id &&
                    "border-primary ring-2 ring-primary/30 bg-secondary"
                )}
              >
                <RadioGroupItem value={algo.id} id={algo.id} className="border-muted-foreground" />
                {algo.icon}
                <span className="font-semibold text-foreground">{algo.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="w-full space-y-2">
          <Label htmlFor="hash-output" className="font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Generated Hash
          </Label>
          <div className="relative">
            <Input
              id="hash-output"
              readOnly
              value={isPending ? "Generating..." : hashedOutput}
              placeholder="Your hash will appear here"
              className="pr-24 h-12 text-sm font-mono bg-secondary/50 text-foreground truncate border-border hover:border-border focus:border-border"
              aria-label="Generated hash"
              aria-live="polite"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  disabled={!hashedOutput || isPending || hashedOutput.startsWith("Error")}
                  className="h-10 w-10 text-accent hover:text-accent-foreground"
                  aria-label="Copy hash"
                  title="Copy hash to clipboard"
                >
                  <Copy
                    className={cn(
                      "transition-transform duration-300 h-4 w-4",
                      isCopied && "scale-125 rotate-12 text-green-500"
                    )}
                  />
                </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!hashedOutput || isPending || hashedOutput.startsWith("Error")}
                    className="h-10 w-10 text-accent hover:text-accent-foreground"
                    aria-label="Download hash"
                    title="Download hash"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => handleDownload("txt")} className="cursor-pointer"><FileText className="mr-2 h-4 w-4" />TXT</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleDownload("json")} className="cursor-pointer"><FileJson className="mr-2 h-4 w-4" />JSON</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleDownload("qr")} className="cursor-pointer"><QrCode className="mr-2 h-4 w-4" />QR Code</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <Alert className="border-primary/20 bg-primary/5">
          <Lightbulb className="h-4 w-4 text-primary" />
          <AlertTitle className="font-semibold">What are Salt and Pepper?</AlertTitle>
          <AlertDescription className="text-sm space-y-2 mt-2">
            <p><strong>Salt:</strong> A unique, random string added to each input before hashing. It ensures that even identical inputs result in different hashes, protecting against pre-computed hash tables (rainbow tables).</p>
            <p><strong>Pepper:</strong> A secret, static string added before hashing, typically stored securely and separately from your data. It adds an extra layer of security, making it much harder for attackers to crack hashes even if they compromise your database.</p>
          </AlertDescription>
        </Alert>
      <div style={{ display: 'none' }}>
        <QRCode id="qr-code-canvas" value={hashedOutput} size={256} level={"H"} />
      </div>
    </div>
  );
}

function HashComparisonTool() {
    const [inputText1, setInputText1] = useState('');
    const [inputText2, setInputText2] = useState('');
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('sha256');
    const [hash1, setHash1] = useState('');
    const [hash2, setHash2] = useState('');
    const [areHashesMatching, setAreHashesMatching] = useState<boolean | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const h1 = await generateHashInternal(inputText1, selectedAlgorithm);
            const h2 = await generateHashInternal(inputText2, selectedAlgorithm);
            setHash1(h1);
            setHash2(h2);
            if(inputText1 && inputText2) {
              setAreHashesMatching(h1 === h2);
            } else {
              setAreHashesMatching(null);
            }
        });
    }, [inputText1, inputText2, selectedAlgorithm]);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-2">
                <Dices className="h-4 w-4" />
                Select Algorithm
              </Label>
              <RadioGroup
                value={selectedAlgorithm}
                onValueChange={setSelectedAlgorithm}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {algorithms.map((algo) => (
                  <Label
                    key={algo.id}
                    htmlFor={`compare-${algo.id}`}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border-2 border-transparent bg-secondary/50 cursor-pointer hover:border-primary/50 transition-all",
                      selectedAlgorithm === algo.id && "border-primary ring-2 ring-primary/30 bg-secondary"
                    )}
                  >
                    <RadioGroupItem value={algo.id} id={`compare-${algo.id}`} className="border-muted-foreground" />
                    {algo.icon}
                    <span className="font-semibold text-foreground">{algo.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label htmlFor="text-input-1" className="font-semibold flex items-center gap-2">
                      <ShieldHalf className="h-4 w-4" />
                      Input Text 1
                    </Label>
                    <Textarea
                        id="text-input-1"
                        placeholder="Paste first text here"
                        value={inputText1}
                        onChange={(e) => setInputText1(e.target.value)}
                        className="min-h-[100px] resize-none"
                    />
                    <Input 
                      readOnly 
                      value={isPending && inputText1 ? "Generating..." : hash1} 
                      placeholder="Hash will appear here" 
                      className="font-mono text-sm bg-secondary/50"
                    />
                </div>
                <div className="space-y-3">
                    <Label htmlFor="text-input-2" className="font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Input Text 2
                    </Label>
                    <Textarea
                        id="text-input-2"
                        placeholder="Paste second text here"
                        value={inputText2}
                        onChange={(e) => setInputText2(e.target.value)}
                        className="min-h-[100px] resize-none"
                    />
                    <Input 
                      readOnly 
                      value={isPending && inputText2 ? "Generating..." : hash2} 
                      placeholder="Hash will appear here" 
                      className="font-mono text-sm bg-secondary/50" 
                    />
                </div>
            </div>
            {areHashesMatching !== null && (
                <div className={cn("p-4 rounded-lg text-center font-semibold text-lg", areHashesMatching ? "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30" : "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30")}>
                    {areHashesMatching ? '✅ Hashes Match' : '❌ Hashes Do Not Match'}
                </div>
            )}
        </div>
    );
}

type BatchResult = {
    line: number;
    input: string;
    hash: string;
};

function BatchHashingTool() {
    const [results, setResults] = useState<BatchResult[]>([]);
    const [isPending, startTransition] = useTransition();
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('sha256');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

            startTransition(async () => {
                const newResults: BatchResult[] = await Promise.all(
                    lines.map(async (line, index) => ({
                        line: index + 1,
                        input: line,
                        hash: await generateHashInternal(line, selectedAlgorithm),
                    }))
                );
                setResults(newResults);
                toast({ title: `Processed ${newResults.length} lines.` });
            });
        };
        reader.readAsText(file);
    };

    const handleDownload = (format: 'csv' | 'json') => {
        if (results.length === 0) {
            toast({ variant: 'destructive', title: 'No results to download.'});
            return;
        };

        let content = '';
        let mimeType = '';
        let filename = `batch_hashes_${selectedAlgorithm}.${format}`;

        if (format === 'json') {
            content = JSON.stringify(results, null, 2);
            mimeType = 'application/json';
        } else { // csv
            const header = 'line,input,hash\n';
            const rows = results.map(r => `${r.line},"${r.input.replace(/"/g, '""')}",${r.hash}`).join('\n');
            content = header + rows;
            mimeType = 'text/csv';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: `Downloaded ${filename}` });
    };

    return (
        <div className="space-y-6">
             <div className="space-y-3">
                <Label className="font-semibold flex items-center gap-2">
                  <Dices className="h-4 w-4" />
                  Select Algorithm
                </Label>
                <RadioGroup value={selectedAlgorithm} onValueChange={setSelectedAlgorithm} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {algorithms.map((algo) => (
                        <Label key={`batch-${algo.id}`} htmlFor={`batch-${algo.id}`}
                            className={cn("flex items-center space-x-3 p-4 rounded-lg border-2 border-transparent bg-secondary/50 cursor-pointer hover:border-primary/50 transition-all", selectedAlgorithm === algo.id && "border-primary ring-2 ring-primary/30 bg-secondary")}>
                            <RadioGroupItem value={algo.id} id={`batch-${algo.id}`} className="border-muted-foreground" />
                            {algo.icon}
                            <span className="font-semibold text-foreground">{algo.label}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.csv" className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} className="w-full" disabled={isPending} size="lg">
                <Upload className="mr-2 h-4 w-4" /> {isPending ? 'Processing...' : 'Upload .txt or .csv File'}
            </Button>
            
            {results.length > 0 && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <FileDown className="h-5 w-5" />
                          Results ({results.length})
                        </h3>
                        <div className="flex gap-2 w-full sm:w-auto">
                             <Button variant="outline" size="sm" onClick={() => handleDownload('csv')} className="flex-1 sm:flex-initial gap-2">
                               <FileDown className="h-4 w-4" /> CSV
                             </Button>
                             <Button variant="outline" size="sm" onClick={() => handleDownload('json')} className="flex-1 sm:flex-initial gap-2">
                               <FileJson className="h-4 w-4" /> JSON
                             </Button>
                        </div>
                    </div>
                     <Card className="max-h-[400px] overflow-y-auto border-border">
                        <CardContent className="p-0">
                           <div className="w-full text-sm">
                                <div className="grid grid-cols-[40px_1fr_2fr] gap-4 p-3 font-semibold bg-secondary/50 sticky top-0 border-b border-border">
                                    <div className="text-muted-foreground">#</div>
                                    <div className="text-muted-foreground">Input</div>
                                    <div className="text-muted-foreground">Hash</div>
                                </div>
                                {results.map(res => (
                                    <div key={res.line} className="grid grid-cols-[40px_1fr_2fr] gap-4 p-3 border-b border-border last:border-b-0 font-mono text-xs">
                                        <div className="truncate text-muted-foreground">{res.line}</div>
                                        <div className="truncate text-foreground/80">{res.input}</div>
                                        <div className="truncate text-foreground/80 break-all">{res.hash}</div>
                                    </div>
                                ))}
                           </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

function HashHistoryTool() {
  const [history, setHistory] = useState<HashHistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("hashHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Could not load history from localStorage", error);
    }
  }, []);
  
  const clearHistory = () => {
    try {
      localStorage.removeItem("hashHistory");
      setHistory([]);
      toast({ title: "History Cleared!" });
    } catch (error) {
      console.error("Could not clear history from localStorage", error);
      toast({ variant: "destructive", title: "Failed to clear history." });
    }
  }

  const exportHistory = () => {
    if (history.length === 0) {
      toast({ variant: 'destructive', title: 'No history to export.'});
      return;
    };
    const content = JSON.stringify(history, null, 2);
    const mimeType = 'application/json';
    const filename = `hash_history_${new Date().toISOString()}.json`;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${filename}` });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Hashing History
        </h3>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={exportHistory} disabled={history.length === 0} className="flex-1 sm:flex-initial gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="destructive" size="sm" onClick={clearHistory} disabled={history.length === 0} className="flex-1 sm:flex-initial gap-2">
              <Trash2 className="h-4 w-4" /> Clear
            </Button>
        </div>
      </div>
      <Card className="max-h-[500px] overflow-y-auto border-border">
        <CardContent className="p-0">
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm">
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Timestamp</TableHead>
                    <TableHead className="text-muted-foreground">Algorithm</TableHead>
                    <TableHead className="text-muted-foreground">Input</TableHead>
                    <TableHead className="text-muted-foreground">Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id} className="border-b border-border last:border-b-0">
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{item.timestamp}</TableCell>
                      <TableCell className="font-semibold text-sm">{item.algorithm.toUpperCase()}</TableCell>
                      <TableCell className="font-mono text-xs max-w-xs truncate text-foreground/80">{item.input}</TableCell>
                      <TableCell className="font-mono text-xs max-w-xs truncate text-foreground/80">{item.hash}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="p-12 text-center text-muted-foreground">
                <History className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-4 font-semibold">No hash history yet.</p>
                <p className="text-sm mt-2">Generate some hashes in the "Generator" tab to see them here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function HashVisualizerTool() {
  const [hash, setHash] = useState('');

  const grid = useMemo(() => {
    if (hash.length < 16) return []; // Ensure we have enough data for a grid
    
    const size = 8; // 8x8 grid
    const pixels = [];
    
    for (let i = 0; i < size * size; i++) {
      // Use 2 chars for hue, 1 for saturation, 1 for lightness
      const hashSegment = hash.substring((i * 2) % hash.length, ((i * 2) % hash.length) + 4);
      if (hashSegment.length < 2) continue;

      const hue = (parseInt(hashSegment.substring(0, 2), 16) / 255) * 360;
      const saturation = 60 + (parseInt(hashSegment.charAt(2) || '8', 16) / 15) * 30;
      const lightness = 40 + (parseInt(hashSegment.charAt(3) || '8', 16) / 15) * 30;

      pixels.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return pixels;
  }, [hash]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="hash-visualizer-input" className="font-semibold flex items-center gap-2">
          <Paintbrush className="h-4 w-4" />
          Hash to Visualize
        </Label>
        <Input 
          id="hash-visualizer-input"
          placeholder="Paste a hash here to visualize it"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          className="font-mono text-sm"
        />
      </div>

      {hash.length >= 16 ? (
        <div className="flex justify-center items-center py-8">
            <div className="p-6 bg-secondary/30 rounded-lg border border-border">
                <div className="grid grid-cols-8 gap-2 w-80 h-80 border-2 border-border rounded-lg overflow-hidden shadow-lg bg-background">
                    {grid.map((color, index) => (
                        <div
                            key={index}
                            className="w-full h-full rounded-sm transition-transform hover:scale-110 shadow-sm"
                            style={{ backgroundColor: color }}
                            title={`Pixel ${index + 1}: ${color}`}
                        />
                    ))}
                </div>
            </div>
        </div>
      ) : (
        <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-secondary/10">
            <Palette className="mx-auto h-12 w-12 opacity-50" />
            <p className="mt-4 font-semibold">No hash to visualize.</p>
            <p className="text-sm mt-2">Paste a hash (at least 16 characters) in the input field above to see its visual representation.</p>
        </div>
      )}

      <Alert className="border-primary/20 bg-primary/5">
        <Paintbrush className="h-4 w-4 text-primary" />
        <AlertTitle className="font-semibold">How does this work?</AlertTitle>
        <AlertDescription className="text-sm mt-2">
          The visualizer converts parts of the hash string into HSL (Hue, Saturation, Lightness) color values to create a unique piece of pixel art. This provides a quick, visual way to "see" if two hashes are different. Each hash produces a unique visual fingerprint!
        </AlertDescription>
      </Alert>
    </div>
  )
}

function ThemeSwitcher() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("hacker")}>
          <Bot className="mr-2" /> Hacker
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("zen")}>
           <Palette className="mr-2" /> Zen
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("retro")}>
          <Laptop className="mr-2" /> Retro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="mr-2" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


export function HashGenerator() {
  const { setTheme } = useTheme();

  React.useEffect(() => {
    // Set a default theme or get from local storage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme('dark');
    }
  }, [setTheme]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-background to-background/95">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
            <a href="/" className="flex items-center space-x-2 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <span className="hidden sm:inline-block font-bold text-xl text-foreground">
                Hashify
              </span>
            </a>
            <nav className="flex items-center gap-4">
              <a 
                href="https://github.com/Centre-for-Information-Technology-India/Hashify" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                GitHub
              </a>
              <ThemeSwitcher />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-5xl w-full">
            {/* Hero Section */}
            <div className="text-center mb-12 sm:mb-16 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Secure & Fast Hash Generation</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline tracking-tighter font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Hashify
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                A versatile, open-source cryptographic hash toolkit for developers and security professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="gap-2">
                  <a href="#features">Get Started</a>
                </Button>
                <Button 
                  asChild 
                  variant="outline"
                  className="gap-2"
                >
                  <a href="https://github.com/Centre-for-Information-Technology-India/Hashify" target="_blank">
                    <GitCompareArrows className="h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Features Grid */}
            <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12 w-full">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors">
                <ShieldCheck className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm text-foreground">Hash Generator</h3>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors">
                <GitCompareArrows className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm text-foreground">Compare Hashes</h3>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors">
                <Upload className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm text-foreground">Batch Processing</h3>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors">
                <History className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm text-foreground">History Tracking</h3>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors">
                <Paintbrush className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm text-foreground">Visualization</h3>
              </div>
            </div>

            <Tabs defaultValue="generator" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2">
                <TabsTrigger value="generator" className="gap-2 text-xs sm:text-sm"><ShieldCheck className="h-4 w-4" /><span className="hidden sm:inline">Generator</span></TabsTrigger>
                <TabsTrigger value="comparison" className="gap-2 text-xs sm:text-sm"><GitCompareArrows className="h-4 w-4" /><span className="hidden sm:inline">Compare</span></TabsTrigger>
                <TabsTrigger value="batch" className="gap-2 text-xs sm:text-sm"><Upload className="h-4 w-4" /><span className="hidden sm:inline">Batch</span></TabsTrigger>
                <TabsTrigger value="history" className="gap-2 text-xs sm:text-sm"><History className="h-4 w-4" /><span className="hidden sm:inline">History</span></TabsTrigger>
                <TabsTrigger value="visualizer" className="gap-2 text-xs sm:text-sm"><Paintbrush className="h-4 w-4" /><span className="hidden sm:inline">Visualize</span></TabsTrigger>
              </TabsList>
              <div className="mt-6 rounded-lg border border-border bg-card p-6 w-full">
                <TabsContent value="generator" className="mt-0">
                  <HashGeneratorTool />
                </TabsContent>
                <TabsContent value="comparison" className="mt-0">
                  <HashComparisonTool />
                </TabsContent>
                <TabsContent value="batch" className="mt-0">
                  <BatchHashingTool />
                </TabsContent>
                <TabsContent value="history" className="mt-0">
                  <HashHistoryTool />
                </TabsContent>
                <TabsContent value="visualizer" className="mt-0">
                  <HashVisualizerTool />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 md:py-12 border-t border-border/50 bg-secondary/30 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Hashify</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  A free, open-source cryptographic hash toolkit for developers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-4 text-foreground">Quick Links</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="https://github.com/Centre-for-Information-Technology-India/Hashify" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub Repository</a></li>
                  <li><a href="https://github.com/Centre-for-Information-Technology-India/Hashify/issues" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Report Issues</a></li>
                  <li><a href="https://github.com/Centre-for-Information-Technology-India/Hashify/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Contribute</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-4 text-foreground">Organization</h4>
                <p className="text-sm text-muted-foreground">
                  <a href="https://cit.org.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">
                    Centre for Information Technology (India)
                  </a>
                </p>
                <p className="text-xs text-muted-foreground mt-2">Building tools for a secure digital future</p>
              </div>
            </div>
            
            <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Hashify. Released under the <a href="https://github.com/Centre-for-Information-Technology-India/Hashify/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">MIT License</a>
              </p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <a href="https://github.com/Centre-for-Information-Technology-India/Hashify/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Code of Conduct</a>
                <a href="https://github.com/Centre-for-Information-Technology-India/Hashify/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Security</a>
                <a href="https://github.com/Centre-for-Information-Technology-India/Hashify/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Privacy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

    