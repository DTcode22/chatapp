#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { downloadYouTube } from './services/youtube.js';
import { downloadSoundCloud } from './services/soundcloud.js';
import { checkFFmpeg } from './utils/ffmpeg.js';
import { version } from '../package.json';

// Create a new command program
const program = new Command();

// Configure the program
program
  .name('music-dl')
  .description('Download music from YouTube and SoundCloud with FFmpeg for best quality')
  .version(version);

// YouTube download command
program
  .command('youtube')
  .alias('yt')
  .description('Download audio from YouTube')
  .argument('<url>', 'YouTube video or playlist URL')
  .option('-o, --output <directory>', 'Output directory', './downloads')
  .option('-f, --format <format>', 'Audio format (mp3, aac, flac, opus)', 'mp3')
  .option('-q, --quality <quality>', 'Audio quality (highest, high, medium, low)', 'highest')
  .action(async (url, options) => {
    try {
      // Check if FFmpeg is installed
      await checkFFmpeg();
      
      // Download from YouTube
      await downloadYouTube(url, options);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// SoundCloud download command
program
  .command('soundcloud')
  .alias('sc')
  .description('Download audio from SoundCloud')
  .argument('<url>', 'SoundCloud track or playlist URL')
  .option('-o, --output <directory>', 'Output directory', './downloads')
  .option('-f, --format <format>', 'Audio format (mp3, aac, flac, opus)', 'mp3')
  .option('-q, --quality <quality>', 'Audio quality (highest, high, medium, low)', 'highest')
  .action(async (url, options) => {
    try {
      // Check if FFmpeg is installed
      await checkFFmpeg();
      
      // Download from SoundCloud
      await downloadSoundCloud(url, options);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Interactive mode command
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    try {
      // Check if FFmpeg is installed
      await checkFFmpeg();
      
      // Ask for source
      const { source } = await inquirer.prompt([
        {
          type: 'list',
          name: 'source',
          message: 'Select the source:',
          choices: ['YouTube', 'SoundCloud']
        }
      ]);
      
      // Ask for URL
      const { url } = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: `Enter the ${source} URL:`,
          validate: (input) => input.trim() !== '' ? true : 'URL is required'
        }
      ]);
      
      // Ask for format
      const { format } = await inquirer.prompt([
        {
          type: 'list',
          name: 'format',
          message: 'Select audio format:',
          choices: ['mp3', 'aac', 'flac', 'opus'],
          default: 'mp3'
        }
      ]);
      
      // Ask for quality
      const { quality } = await inquirer.prompt([
        {
          type: 'list',
          name: 'quality',
          message: 'Select audio quality:',
          choices: ['highest', 'high', 'medium', 'low'],
          default: 'highest'
        }
      ]);
      
      // Ask for output directory
      const { output } = await inquirer.prompt([
        {
          type: 'input',
          name: 'output',
          message: 'Enter output directory:',
          default: './downloads'
        }
      ]);
      
      const options = { format, quality, output };
      
      // Download based on source
      if (source === 'YouTube') {
        await downloadYouTube(url, options);
      } else {
        await downloadSoundCloud(url, options);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// If no arguments provided, show help
if (process.argv.length === 2) {
  program.help();
}

// Parse command line arguments
program.parse();
