import axios from 'axios';
import { Message, OpenRouterModel } from '@/types';

export async function getChatCompletion(messages: Message[], modelId: string) {
  try {
    const formattedMessages = messages.map((msg) => {
      const formattedMsg: {
        role: string;
        content:
          | string
          | Array<{ type: string; text?: string; image_url?: { url: string } }>;
      } = {
        role: msg.role,
        content: msg.content,
      };

      if (msg.attachments && msg.attachments.length > 0) {
        // Initialize content as an array
        formattedMsg.content = [{ type: 'text', text: msg.content }];

        msg.attachments.forEach((attachment) => {
          if (attachment.type === 'image') {
            // TypeScript knows formattedMsg.content is an array here
            (
              formattedMsg.content as Array<{
                type: string;
                text?: string;
                image_url?: { url: string };
              }>
            ).push({
              type: 'image_url',
              image_url: { url: attachment.url },
            });
          }
        });
      }

      return formattedMsg;
    });

    const response = await axios.post('/api/chat', {
      model: modelId,
      messages: formattedMessages,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
}

export function parseModels(): OpenRouterModel[] {
  const modelsText = `
nvidia/llama-3.1-nemotron-nano-8b-v1:free,NVIDIA: Llama 3.1 Nemotron Nano 8B v1 (free),131072
nvidia/llama-3.3-nemotron-super-49b-v1:free,NVIDIA: Llama 3.3 Nemotron Super 49B v1 (free),131072
nvidia/llama-3.1-nemotron-ultra-253b-v1:free,NVIDIA: Llama 3.1 Nemotron Ultra 253B v1 (free),131072
meta-llama/llama-4-maverick:free,Meta: Llama 4 Maverick (free),256000
meta-llama/llama-4-scout:free,Meta: Llama 4 Scout (free),512000
openrouter/quasar-alpha,Quasar Alpha,1000000
deepseek/deepseek-v3-base:free,DeepSeek: DeepSeek V3 Base (free),131072
allenai/molmo-7b-d:free,AllenAI: Molmo 7B D (free),4096
bytedance-research/ui-tars-72b:free,Bytedance: UI-TARS 72B (free),32768
qwen/qwen2.5-vl-3b-instruct:free,Qwen: Qwen2.5 VL 3B Instruct (free),64000
google/gemini-2.5-pro-exp-03-25:free,Google: Gemini 2.5 Pro Experimental (free),1000000
qwen/qwen2.5-vl-32b-instruct:free,Qwen: Qwen2.5 VL 32B Instruct (free),8192
deepseek/deepseek-chat-v3-0324:free,DeepSeek: DeepSeek V3 0324 (free),131072
featherless/qwerky-72b:free,Qwerky 72B (free),32768
mistralai/mistral-small-3.1-24b-instruct:free,Mistral: Mistral Small 3.1 24B (free),96000
huggingfaceh4/zephyr-7b-beta:free,Hugging Face: Zephyr 7B (free),4096
  `;

  return modelsText
    .trim()
    .split('\n')
    .map((line) => {
      const [id, name, contextLength] = line.split(',');

      const multimodalModels = [
        'meta-llama/llama-4-maverick:free',
        'meta-llama/llama-4-scout:free',
        'allenai/molmo-7b-d:free',
        'bytedance-research/ui-tars-72b:free',
        'qwen/qwen2.5-vl-3b-instruct:free',
        'qwen/qwen2.5-vl-32b-instruct:free',
        'google/gemini-2.5-pro-exp-03-25:free',
        'mistralai/mistral-small-3.1-24b-instruct:free',
      ];

      return {
        id,
        name,
        contextLength: parseInt(contextLength, 10),
        multimodal: multimodalModels.includes(id),
      };
    });
}
