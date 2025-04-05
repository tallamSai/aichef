
import React, { useState } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import ApiKeyInput from '@/components/ApiKeyInput';
import RecipeForm from '@/components/RecipeForm';
import RecipeCard from '@/components/RecipeCard';
import { useApiKey } from '@/hooks/useApiKey';
import { generateRecipes } from '@/services/openaiService';
import { parseRecipes } from '@/utils/recipeUtils';
import { Recipe } from '@/types/Recipe';
import { Brain, UtensilsCrossed, Sparkles } from 'lucide-react';

const Index = () => {
  const { apiKeyConfig, hasApiKey, updateApiKey } = useApiKey();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async (prompt: string, requirements: string, dietaryRestrictions: string) => {
    setIsGenerating(true);
    
    try {
      const result = await generateRecipes(apiKeyConfig.apiKey, {
        foodPrompt: prompt,
        additionalRequirements: requirements,
        healthCondition: dietaryRestrictions,
        modelProvider: apiKeyConfig.provider,
        model: apiKeyConfig.model,
        customEndpoint: apiKeyConfig.customEndpoint
      });
      
      const parsedRecipes = parseRecipes(result);
      
      if (parsedRecipes.length === 0) {
        toast.error("Couldn't parse any recipes from the response. Please try again.");
      } else {
        setRecipes(parsedRecipes);
        toast.success(`Generated ${parsedRecipes.length} delicious recipes!`);
      }
    } catch (error) {
      console.error('Error generating recipes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate recipes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <Header />
      
      <main className="container mx-auto px-4">
        <section className="max-w-3xl mx-auto mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4 neon-text animate-pulse-light">
            <Sparkles className="inline-block w-8 h-8 mr-2" />
            AstroChef AI
          </h1>
          <p className="text-xl text-space-light/80 mb-6">
            Discover health-focused recipes personalized to your needs and dietary requirements
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center glass-card p-4 rounded-lg animate-float">
              <Brain className="w-6 h-6 text-neon-purple mr-2" />
              <span>AI-Powered Recipes</span>
            </div>
            <div className="flex items-center glass-card p-4 rounded-lg animate-float">
              <UtensilsCrossed className="w-6 h-6 text-cyber-green mr-2" />
              <span>Health-Optimized</span>
            </div>
            <div className="flex items-center glass-card p-4 rounded-lg animate-float">
              <Sparkles className="w-6 h-6 text-cyber-pink mr-2" />
              <span>Disease-Conscious</span>
            </div>
          </div>
          
          <ApiKeyInput 
            onApiKeySubmit={updateApiKey} 
            hasApiKey={hasApiKey} 
            apiKeyConfig={apiKeyConfig}
          />
          
          <RecipeForm 
            onGenerate={handleGenerate} 
            isGenerating={isGenerating}
            hasApiKey={hasApiKey}
            provider={apiKeyConfig.provider}
          />
        </section>
        
        {recipes.length > 0 && (
          <section className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center neon-text">
              <UtensilsCrossed className="inline-block w-6 h-6 mr-2" />
              Your Personalized Recipes
            </h2>
            
            <div className="space-y-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
