import { useState } from "react";
import { Calculator, Trophy, Shield, Zap, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  email: string;
  filing: string;
  home: string;
  k1Forms: number;
  states: number;
}

interface QuoteResult {
  total: number;
  breakdown: {
    base: number;
    state: number;
    k1: number;
    home: number;
  };
}

const filingStatuses = [
  "Single",
  "Head of Household", 
  "Married Filing Jointly",
  "Married Filing Separately"
];

const k1Options = ["0", "1", "2-5", "6-14", "15+"];
const stateOptions = ["0", "1", "2-5", "6-9", "10+"];

const stateFeeMap = { "0": 0, "1": 250, "2-5": 650, "6-9": 1450, "10+": 2050 };
const k1FeeMap = { "0": 0, "1": 200, "2-5": 600, "6-14": 2000, "15+": 3000 };

export function TaxQuoteCalculator() {
  const [showQuote, setShowQuote] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    filing: "",
    home: "",
    k1Forms: 0,
    states: 0
  });
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const { toast } = useToast();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim() || !emailRegex.test(formData.email)) {
      toast({
        title: "Required Fields Missing",
        description: "Please provide your name and a valid email address.",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.filing || !formData.home) {
      toast({
        title: "Please Complete All Fields",
        description: "Filing status and home ownership are required.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const calculateQuote = () => {
    if (!validateForm()) return;

    const base = 350;
    const k1Value = k1Options[formData.k1Forms];
    const stateValue = stateOptions[formData.states];
    
    const breakdown = {
      base,
      state: stateFeeMap[stateValue as keyof typeof stateFeeMap],
      k1: k1FeeMap[k1Value as keyof typeof k1FeeMap],
      home: formData.home === "Yes" ? 150 : 0
    };

    const total = breakdown.base + breakdown.state + breakdown.k1 + breakdown.home;
    
    setQuote({ total, breakdown });
    setShowQuote(true);
    
    toast({
      title: "Quote Generated! 🎉",
      description: "Your 1040 pricing estimate is ready."
    });
  };

  const resetCalculator = () => {
    setShowQuote(false);
    setFormData({
      name: "",
      email: "",
      filing: "",
      home: "",
      k1Forms: 0,
      states: 0
    });
    setQuote(null);
  };


  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl card-enterprise animate-fade-in">
        <CardContent className="p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-primary rounded-2xl shadow-lg">
                <Calculator className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                1040 Pricing Estimator
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get an estimate for your tax return preparation costs
            </p>
          </div>

          {/* Input Form */}
          {!showQuote && (
            <div className="space-y-8 animate-slide-up">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Filing Status</Label>
                  <RadioGroup
                    value={formData.filing}
                    onValueChange={(value) => setFormData({...formData, filing: value})}
                    className="grid sm:grid-cols-2 gap-4"
                  >
                    {filingStatuses.map((status) => (
                      <div key={status} className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                        <RadioGroupItem value={status} id={status} />
                        <Label htmlFor={status} className="flex-1 cursor-pointer text-sm font-medium">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Do you own your home?</Label>
                  <RadioGroup
                    value={formData.home}
                    onValueChange={(value) => setFormData({...formData, home: value})}
                    className="grid grid-cols-2 gap-4"
                  >
                    {["Yes", "No"].map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                        <RadioGroupItem value={option} id={`home-${option}`} />
                        <Label htmlFor={`home-${option}`} className="flex-1 cursor-pointer text-sm font-medium">
                          {option === "Yes" ? "Yes, I own my home" : "No, I rent or other"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">
                      K-1 Forms: <span className="text-primary font-bold">{k1Options[formData.k1Forms]}</span>
                    </Label>
                    <div className="px-3">
                      <Slider
                        value={[formData.k1Forms]}
                        onValueChange={(value) => setFormData({...formData, k1Forms: value[0]})}
                        max={4}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>None</span>
                      <span>15+</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">
                      States Filing: <span className="text-primary font-bold">{stateOptions[formData.states]}</span>
                    </Label>
                    <div className="px-3">
                      <Slider
                        value={[formData.states]}
                        onValueChange={(value) => setFormData({...formData, states: value[0]})}
                        max={4}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>None</span>
                      <span>10+</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-12">
                <Button onClick={calculateQuote} className="btn-enterprise px-12 py-4 text-lg">
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate My Quote
                </Button>
              </div>
            </div>
          )}

          {/* Quote Results */}
          {showQuote && quote && (
            <div className="text-center space-y-8 animate-slide-up">
              <div className="bg-gradient-success text-success-foreground rounded-2xl p-8 mb-8">
                <div className="text-5xl font-bold mb-2 animate-bounce-gentle">
                  ${quote.total.toLocaleString()}
                </div>
                <p className="text-xl opacity-90">Your 1040 Preparation Cost</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-bold text-primary">${quote.breakdown.base}</div>
                  <div className="text-sm text-muted-foreground">Base Service</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-bold text-primary">${quote.breakdown.state}</div>
                  <div className="text-sm text-muted-foreground">State Filing</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-bold text-primary">${quote.breakdown.k1}</div>
                  <div className="text-sm text-muted-foreground">K-1 Forms</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-bold text-primary">${quote.breakdown.home}</div>
                  <div className="text-sm text-muted-foreground">Home Owner</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-success px-8 py-3">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Accept Quote & Continue
                </Button>
                <Button variant="outline" onClick={resetCalculator} className="px-8 py-3">
                  Calculate New Quote
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}